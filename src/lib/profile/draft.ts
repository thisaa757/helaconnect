// One local profile for this browser. Signup and the profile page share it.
// Nothing is sent to Supabase or another service.

import { readStoredAds, type ProfileAd } from "@/lib/profile/ads";
import type { ProfileFormValues } from "@/lib/profile/types";
import { emptyProfileForm } from "@/lib/profile/validate";
import type { Role } from "@/lib/signup/validate";

export type ProfileDraft = {
  signedUp: boolean;
  role: Role;
  email: string;
  phone: string;
  values: ProfileFormValues;
  interests: string[];
  ads: ProfileAd[];
};

const STORAGE_KEY = "wedamate-profile";

const emptyValues = emptyProfileForm();

const emptyDraft: ProfileDraft = {
  signedUp: false,
  role: "worker",
  email: "",
  phone: "",
  values: emptyValues,
  interests: [],
  ads: [],
};

let draft: ProfileDraft = emptyDraft;
let loaded = false;
const listeners = new Set<() => void>();

function isRole(value: unknown): value is Role {
  return value === "worker" || value === "customer";
}

function readStored(): ProfileDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProfileDraft>;
    if (!isRole(parsed.role) || !parsed.values || typeof parsed.values !== "object") return null;
    const values = parsed.values;
    return {
      signedUp: parsed.signedUp === true,
      role: parsed.role,
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      values: {
        fullName: typeof values.fullName === "string" ? values.fullName : "",
        businessName: typeof values.businessName === "string" ? values.businessName : "",
        businessType: typeof values.businessType === "string" ? values.businessType : "",
        description: typeof values.description === "string" ? values.description : "",
        district: typeof values.district === "string" ? values.district : "",
        businessPhone: typeof values.businessPhone === "string" ? values.businessPhone : "",
      },
      interests: Array.isArray(parsed.interests) ? parsed.interests.filter((id) => typeof id === "string") : [],
      ads: readStoredAds(parsed.ads),
    };
  } catch {
    return null;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = readStored();
  if (stored) draft = stored;
}

export function getProfileDraft(): ProfileDraft {
  ensureLoaded();
  return draft;
}

export function getServerProfileDraft(): ProfileDraft {
  return emptyDraft;
}

export function subscribeProfileDraft(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setProfileDraft(next: ProfileDraft) {
  draft = next;
  loaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The open pages still share this copy when storage is blocked.
  }
  listeners.forEach((listener) => listener());
}
