// Loads a profile through the browser client.
// Public columns come from public_profiles, so personal phone and email stay off that view.

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/signup/validate";
import type { ProfileStats, PublicProfile, ReviewItem } from "@/lib/profile/types";
import { isUuid } from "@/lib/profile/validate";

export type LoadedProfile = {
  profile: PublicProfile;
  email: string | null;
  viewerId: string | null;
  viewerRole: Role | null;
  stats: ProfileStats;
  reviews: ReviewItem[];
  myRating: { stars: number; comment: string } | null;
  interests: string[];
  ratingsError: boolean;
  interestsError: boolean;
};

export type LoadResult =
  | { status: "loading" }
  | { status: "ready"; data: LoadedProfile }
  | { status: "signedOut" }
  | { status: "unavailable" }
  | { status: "missing" }
  | { status: "error" };

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  district: string;
  business_name: string | null;
  business_phone: string | null;
  business_type: string | null;
  description: string | null;
  language: string;
  created_at: string;
};

function isRole(value: string): value is Role {
  return value === "worker" || value === "customer";
}

function toProfile(row: ProfileRow): PublicProfile | null {
  if (!isRole(row.role)) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    district: row.district,
    businessName: row.business_name,
    businessPhone: row.business_phone,
    businessType: row.business_type,
    description: row.description,
    language: row.language,
    createdAt: row.created_at,
  };
}

function readStats(row: { avg_stars: number | string | null; rating_count: number | string | null } | null): ProfileStats {
  if (!row) return { avg: null, count: 0 };
  const count = Number(row.rating_count);
  const avg = row.avg_stars === null || row.avg_stars === undefined ? null : Number(row.avg_stars);
  return {
    avg: avg !== null && Number.isFinite(avg) ? avg : null,
    count: Number.isFinite(count) ? count : 0,
  };
}

export async function loadProfile(mode: "own" | "public", userId?: string): Promise<LoadResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { status: "unavailable" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    const message = userError?.message?.toLowerCase() ?? "";
    if (!userError || message.includes("session") || message.includes("jwt") || message.includes("claim")) {
      return { status: "signedOut" };
    }
    return { status: "error" };
  }
  const viewer = userData.user;

  const profileId = mode === "own" ? viewer.id : (userId ?? "");
  if (mode === "public" && !isUuid(profileId)) return { status: "missing" };

  const { data: row, error: profileError } = await supabase
    .from("public_profiles")
    .select("id, full_name, role, district, business_name, business_phone, business_type, description, language, created_at")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !row) {
    if (profileError) return { status: "error" };
    return { status: "missing" };
  }

  const profile = toProfile(row as ProfileRow);
  if (!profile) return { status: "error" };

  const [statsResult, reviewsResult, interestsResult, roleResult, mineResult] = await Promise.all([
    supabase.from("profile_stats").select("avg_stars, rating_count").eq("ratee_id", profileId).maybeSingle(),
    supabase
      .from("ratings")
      .select("id, stars, comment, created_at")
      .eq("ratee_id", profileId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("profile_interests").select("category_id").eq("user_id", profileId),
    viewer.id === profileId
      ? Promise.resolve({ data: { role: profile.role }, error: null })
      : supabase.from("profiles").select("role").eq("id", viewer.id).maybeSingle(),
    mode === "public" && viewer.id !== profileId
      ? supabase.from("ratings").select("stars, comment").eq("rater_id", viewer.id).eq("ratee_id", profileId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const viewerRole = isRole(String(roleResult.data?.role ?? "")) ? (roleResult.data?.role as Role) : null;
  const reviews: ReviewItem[] = reviewsResult.error
    ? []
    : ((reviewsResult.data ?? []) as { id: string; stars: number; comment: string | null; created_at: string }[]).map((item) => ({
        id: item.id,
        stars: item.stars,
        comment: item.comment,
        createdAt: item.created_at,
      }));

  const myRow = mineResult.data as { stars: number; comment: string | null } | null;
  const interests = interestsResult.error
    ? []
    : ((interestsResult.data ?? []) as { category_id: string }[]).map((item) => item.category_id);

  return {
    status: "ready",
    data: {
      profile,
      email: mode === "own" ? (viewer.email ?? null) : null,
      viewerId: viewer.id,
      viewerRole,
      stats: statsResult.error ? { avg: null, count: 0 } : readStats(statsResult.data),
      reviews,
      myRating: myRow ? { stars: myRow.stars, comment: myRow.comment ?? "" } : null,
      interests,
      ratingsError: Boolean(reviewsResult.error || statsResult.error),
      interestsError: Boolean(interestsResult.error),
    },
  };
}
