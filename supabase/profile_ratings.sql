-- Hela Connect profile fields, public view, and ratings.
-- Run this in the Supabase SQL editor after supabase/profiles.sql.
-- Safe to run more than once.
--
-- The anon key stays in the browser. These policies are what limit it.
-- Personal phone stays on profiles and is readable only on the owner's row.
-- Email is not a profiles column. The app reads it from the auth session.

begin;

-- Columns added after the first profiles script. Fresh installs that already
-- include them in profiles.sql are unchanged.
alter table public.profiles add column if not exists business_type text;
alter table public.profiles add column if not exists description text;

alter table public.profiles drop constraint if exists profiles_description_length;
alter table public.profiles
  add constraint profiles_description_length
  check (description is null or char_length(description) <= 400);

-- Editable columns only. role, id, created_at, phone, and language are not granted.
revoke update on table public.profiles from authenticated;
grant update (
  full_name,
  business_name,
  business_type,
  description,
  district,
  business_phone
) on table public.profiles to authenticated;

-- Own row only, so personal phone is not readable on someone else's row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Blocks role, id, and created_at changes even if a later grant is wider.
-- Also blocks personal phone, language, and customer business fields.
create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
as $$
declare
  allowed_types text[] := array[
    'house-cleaning', 'home-cooking', 'laundry', 'childcare', 'elder-care', 'domestic-help',
    'masonry', 'tiling', 'painting', 'carpentry', 'welding', 'roofing',
    'electrical', 'plumbing', 'appliance-repair', 'phone-repair', 'vehicle-repair', 'ac-repair',
    'gardening', 'landscaping', 'pest-control', 'tree-cutting', 'farm-help',
    'three-wheeler', 'goods-transport', 'house-moving', 'private-driver', 'delivery',
    'catering', 'decoration', 'music', 'photography', 'tent-hire', 'bridal-makeup'
  ];
begin
  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.created_at is distinct from old.created_at
     or new.phone is distinct from old.phone
     or new.language is distinct from old.language
  then
    raise exception 'profile_protected_column';
  end if;

  if old.role = 'customer'
     and (
       new.business_name is distinct from old.business_name
       or new.business_type is distinct from old.business_type
       or new.business_phone is distinct from old.business_phone
     )
  then
    raise exception 'profile_customer_business';
  end if;

  if new.business_phone is distinct from old.business_phone
     and new.business_phone is not null
     and new.business_phone !~ '^\+947[0-9]{8}$'
  then
    raise exception 'profile_phone_format';
  end if;

  if new.business_type is not null
     and new.business_type is distinct from old.business_type
     and not (new.business_type = any (allowed_types))
  then
    raise exception 'profile_business_type';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_identity on public.profiles;
create trigger protect_profile_identity
  before update on public.profiles
  for each row
  execute function public.protect_profile_identity();

revoke all on function public.protect_profile_identity() from public;
grant execute on function public.protect_profile_identity() to authenticated;

-- Public read model. security_invoker is off so a signed-in person can read
-- every profile's safe columns while profiles RLS still hides personal phone.
drop view if exists public.public_profiles;
create view public.public_profiles
with (security_barrier = true, security_invoker = false) as
select
  id,
  full_name,
  role,
  district,
  business_name,
  business_phone,
  business_type,
  description,
  language,
  created_at
from public.profiles;

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to authenticated;

-- Ratings. The average is computed here and is never a column on profiles.
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references auth.users (id) on delete cascade,
  ratee_id uuid not null references auth.users (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 200),
  created_at timestamptz not null default now(),
  unique (rater_id, ratee_id),
  check (rater_id <> ratee_id)
);

create index if not exists ratings_ratee_created_idx
  on public.ratings (ratee_id, created_at desc);

alter table public.ratings enable row level security;

revoke all on public.ratings from anon;
grant select, insert, update on public.ratings to authenticated;

drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all"
  on public.ratings
  for select
  to authenticated
  using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own"
  on public.ratings
  for insert
  to authenticated
  with check (rater_id = auth.uid());

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own"
  on public.ratings
  for update
  to authenticated
  using (rater_id = auth.uid())
  with check (rater_id = auth.uid());

-- No delete policy. A signed-in person also cannot delete through a bypass,
-- and the profile owner cannot delete a rating about themselves.
create or replace function public.prevent_rating_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and old.ratee_id = auth.uid() then
    raise exception 'rating_delete_self';
  end if;
  if auth.uid() is not null then
    raise exception 'rating_delete_blocked';
  end if;
  return old;
end;
$$;

drop trigger if exists prevent_rating_delete on public.ratings;
create trigger prevent_rating_delete
  before delete on public.ratings
  for each row
  execute function public.prevent_rating_delete();

-- Reads both roles with definer rights, because the rater cannot select the
-- other person's row from profiles (that row's personal phone is private).
create or replace function public.enforce_rating_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rater_role text;
  ratee_role text;
begin
  if auth.uid() is null or new.rater_id is distinct from auth.uid() then
    raise exception 'rating_not_owner';
  end if;

  if tg_op = 'UPDATE' then
    if new.rater_id is distinct from old.rater_id or new.ratee_id is distinct from old.ratee_id then
      raise exception 'rating_not_owner';
    end if;
  end if;

  if new.rater_id = new.ratee_id then
    raise exception 'rating_self';
  end if;

  select role into rater_role from public.profiles where id = new.rater_id;
  select role into ratee_role from public.profiles where id = new.ratee_id;

  if rater_role is null or ratee_role is null then
    raise exception 'rating_missing_profile';
  end if;

  if rater_role = ratee_role then
    raise exception 'rating_same_role';
  end if;

  if new.comment is not null and char_length(btrim(new.comment)) = 0 then
    new.comment := null;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_rating_rules on public.ratings;
create trigger enforce_rating_rules
  before insert or update on public.ratings
  for each row
  execute function public.enforce_rating_rules();

revoke all on function public.enforce_rating_rules() from public;
revoke all on function public.prevent_rating_delete() from public;
grant execute on function public.enforce_rating_rules() to authenticated;
grant execute on function public.prevent_rating_delete() to authenticated;

drop view if exists public.profile_stats;
create view public.profile_stats
with (security_barrier = true, security_invoker = true) as
select
  ratee_id,
  round(avg(stars)::numeric, 1) as avg_stars,
  count(*)::integer as rating_count
from public.ratings
group by ratee_id;

revoke all on public.profile_stats from public, anon, authenticated;
grant select on public.profile_stats to authenticated;

-- Interest chips. Category ids match src/lib/categories.ts.
create table if not exists public.profile_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id),
  constraint profile_interests_category_id check (category_id in (
    'house-cleaning', 'home-cooking', 'laundry', 'childcare', 'elder-care', 'domestic-help',
    'masonry', 'tiling', 'painting', 'carpentry', 'welding', 'roofing',
    'electrical', 'plumbing', 'appliance-repair', 'phone-repair', 'vehicle-repair', 'ac-repair',
    'gardening', 'landscaping', 'pest-control', 'tree-cutting', 'farm-help',
    'three-wheeler', 'goods-transport', 'house-moving', 'private-driver', 'delivery',
    'catering', 'decoration', 'music', 'photography', 'tent-hire', 'bridal-makeup'
  ))
);

alter table public.profile_interests enable row level security;

revoke all on public.profile_interests from anon;
grant select, insert, delete on public.profile_interests to authenticated;

drop policy if exists "profile_interests_select" on public.profile_interests;
create policy "profile_interests_select"
  on public.profile_interests
  for select
  to authenticated
  using (true);

drop policy if exists "profile_interests_insert_own" on public.profile_interests;
create policy "profile_interests_insert_own"
  on public.profile_interests
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "profile_interests_delete_own" on public.profile_interests;
create policy "profile_interests_delete_own"
  on public.profile_interests
  for delete
  to authenticated
  using (user_id = auth.uid());

commit;
