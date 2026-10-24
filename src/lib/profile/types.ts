// Shapes shared by the profile page, the public page, and the save APIs.

import type { Role } from "@/lib/signup/validate";

export type ProfileFormValues = {
  fullName: string;
  businessName: string;
  businessType: string;
  description: string;
  district: string;
  businessPhone: string;
};

export type ProfileField = keyof ProfileFormValues;

export type ProfileErrorCode =
  | "name"
  | "nameLength"
  | "businessName"
  | "businessNameLength"
  | "businessType"
  | "descriptionLength"
  | "district"
  | "businessPhone"
  | "phoneFormat";

export type ProfileErrors = Partial<Record<ProfileField, ProfileErrorCode>>;

export type PublicProfile = {
  id: string;
  fullName: string;
  role: Role;
  district: string;
  businessName: string | null;
  businessPhone: string | null;
  businessType: string | null;
  description: string | null;
  language: string;
  createdAt: string;
};

export type ReviewItem = {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: string;
};

export type ProfileStats = {
  avg: number | null;
  count: number;
};

export const EDITABLE_FIELDS: ProfileField[] = [
  "fullName",
  "businessName",
  "businessType",
  "description",
  "district",
  "businessPhone",
];

export const CUSTOMER_FIELDS: ProfileField[] = ["fullName", "description", "district"];
