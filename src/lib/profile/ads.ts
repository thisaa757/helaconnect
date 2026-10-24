// Ads saved with the local profile. The sample customer ad is shown, not stored as a new signup.

import { isCategoryId } from "@/lib/categories";
import type { ProfileDraft } from "@/lib/profile/draft";
import { DISTRICTS, type Role } from "@/lib/signup/validate";

export type ProfileAd = {
  id: string;
  role: Role;
  description: string;
  district: string;
  image: string;
  jobRole: string;
  sample: boolean;
};

export const SAMPLE_CUSTOMER_AD_ID = "sample-customer-ad";

export const SAMPLE_CUSTOMER_AD: ProfileAd = {
  id: SAMPLE_CUSTOMER_AD_ID,
  role: "customer",
  description:
    "I need a house cleaner for a 3-bedroom home in Colombo. Please clean the floors, kitchen, and two bathrooms this Saturday morning.",
  district: "Colombo",
  image: "/sample-ads/house-cleaning.svg",
  jobRole: "house-cleaning",
  sample: true,
};

const districtSet = new Set<string>(DISTRICTS);
const MAX_DESCRIPTION = 500;

function cleanImage(value: string): string | null {
  if (value.startsWith("/sample-ads/") && !value.includes("..") && !value.includes("\\")) return value;
  if (/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(value) && value.length <= 2_000_000) return value;
  return null;
}

export function readStoredAds(value: unknown): ProfileAd[] {
  if (!Array.isArray(value)) return [];
  const ads: ProfileAd[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<ProfileAd>;
    if (row.id === SAMPLE_CUSTOMER_AD_ID) continue;
    if (typeof row.id !== "string" || !row.id.trim()) continue;
    if (row.role !== "customer" && row.role !== "worker") continue;
    if (typeof row.description !== "string") continue;
    const description = row.description.trim().slice(0, MAX_DESCRIPTION);
    if (!description) continue;
    if (typeof row.district !== "string" || !districtSet.has(row.district)) continue;
    if (typeof row.jobRole !== "string" || !isCategoryId(row.jobRole)) continue;
    if (typeof row.image !== "string") continue;
    const image = cleanImage(row.image);
    if (!image) continue;
    ads.push({
      id: row.id.slice(0, 80),
      role: row.role,
      description,
      district: row.district,
      image,
      jobRole: row.jobRole,
      sample: false,
    });
  }
  return ads;
}

export function adsForDraft(draft: ProfileDraft): ProfileAd[] {
  if (!draft.signedUp) return [];
  const own = draft.ads.filter((ad) => ad.role === draft.role && ad.id !== SAMPLE_CUSTOMER_AD_ID);
  if (draft.role === "customer") return [...own, SAMPLE_CUSTOMER_AD];
  return own;
}
