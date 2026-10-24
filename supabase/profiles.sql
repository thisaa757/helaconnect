-- Hela Connect profiles.
-- New database: run this file, then profile_ratings.sql.
-- Database that already has profiles: run profile_ratings.sql only.
-- That second file adds the public view, ratings, and the trigger that
-- blocks changes to role, id, and created_at.
--
-- Signup saves a row only when Auth returns a session. In the dashboard,
-- Authentication → Providers → Email, turn off "Confirm email" for the demo
-- so sign-up can insert the profile and redirect immediately.
--
-- The anon key is safe to expose in the browser. These policies let a
-- signed-in person read, insert, and update only the row whose id is their
-- own auth user id. Insert is included because the signup page creates the row.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('worker', 'customer')),
  phone text not null,
  district text not null check (
    district in (
      'Ampara',
      'Anuradhapura',
      'Badulla',
      'Batticaloa',
      'Colombo',
      'Galle',
      'Gampaha',
      'Hambantota',
      'Jaffna',
      'Kalutara',
      'Kandy',
      'Kegalle',
      'Kilinochchi',
      'Kurunegala',
      'Mannar',
      'Matale',
      'Matara',
      'Monaragala',
      'Mullaitivu',
      'Nuwara Eliya',
      'Polonnaruwa',
      'Puttalam',
      'Ratnapura',
      'Trincomalee',
      'Vavuniya'
    )
  ),
  business_name text,
  business_phone text,
  business_type text,
  description text,
  language text not null default 'en' check (language in ('en', 'si', 'ta')),
  created_at timestamptz not null default now(),
  constraint profiles_worker_details check (
    role <> 'worker'
    or (
      business_name is not null
      and length(trim(business_name)) > 0
      and business_phone is not null
    )
  ),
  constraint profiles_description_length check (description is null or char_length(description) <= 400)
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select, insert on public.profiles to authenticated;
grant update (
  full_name,
  business_name,
  business_type,
  description,
  district,
  business_phone
) on public.profiles to authenticated;

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
