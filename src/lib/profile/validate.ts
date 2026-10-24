// Client and server both use these checks.
// Stored business phones are +947XXXXXXXX. 07XXXXXXXX is accepted while typing.

import { isCategoryId } from "@/lib/categories";
import { DISTRICTS, type District, type Role } from "@/lib/signup/validate";
import {
  CUSTOMER_FIELDS,
  EDITABLE_FIELDS,
  type ProfileErrors,
  type ProfileField,
  type ProfileFormValues,
  type PublicProfile,
} from "@/lib/profile/types";

const LOCAL_PHONE = /^07\d{8}$/;
const INTL_PHONE = /^\+947\d{8}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const districtSet = new Set<string>(DISTRICTS);

export function textLength(value: string): number {
  return Array.from(value).length;
}

export function isUuid(value: string): boolean {
  return UUID.test(value);
}

// Collapse spaces and dashes, then store one international form.
export function canonicalPhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  if (LOCAL_PHONE.test(compact)) return `+94${compact.slice(1)}`;
  if (INTL_PHONE.test(compact)) return compact;
  return null;
}

export function formatPhone(value: string): string {
  const canonical = canonicalPhone(value);
  if (!canonical) return value.trim();
  const rest = canonical.slice(3);
  return `+94 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
}

export function whatsAppHref(value: string): string | null {
  const canonical = canonicalPhone(value);
  if (!canonical) return null;
  return `https://wa.me/${canonical.slice(1)}`;
}

export function telHref(value: string): string | null {
  const canonical = canonicalPhone(value);
  return canonical ? `tel:${canonical}` : null;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = Array.from(parts[0])[0] ?? "";
  const second = parts.length > 1 ? (Array.from(parts[1])[0] ?? "") : "";
  return `${first}${second}`.toLocaleUpperCase();
}

export function emptyProfileForm(): ProfileFormValues {
  return {
    fullName: "",
    businessName: "",
    businessType: "",
    description: "",
    district: "",
    businessPhone: "",
  };
}

export function profileToForm(profile: PublicProfile): ProfileFormValues {
  return {
    fullName: profile.fullName,
    businessName: profile.businessName ?? "",
    businessType: profile.businessType ?? "",
    description: profile.description ?? "",
    district: profile.district,
    businessPhone: profile.businessPhone ?? "",
  };
}

export function fieldsForRole(role: Role): ProfileField[] {
  return role === "worker" ? EDITABLE_FIELDS : CUSTOMER_FIELDS;
}

export function validateProfile(values: ProfileFormValues, role: Role): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = values.fullName.trim();
  const nameLength = textLength(name);
  if (!name) errors.fullName = "name";
  else if (nameLength < 2 || nameLength > 60) errors.fullName = "nameLength";

  if (textLength(values.description.trim()) > 400) errors.description = "descriptionLength";
  if (!districtSet.has(values.district)) errors.district = "district";

  if (role === "worker") {
    const business = values.businessName.trim();
    const businessLength = textLength(business);
    if (!business) errors.businessName = "businessName";
    else if (businessLength < 2 || businessLength > 80) errors.businessName = "businessNameLength";
    if (!isCategoryId(values.businessType)) errors.businessType = "businessType";
    if (!values.businessPhone.trim()) errors.businessPhone = "businessPhone";
    else if (!canonicalPhone(values.businessPhone)) errors.businessPhone = "phoneFormat";
  }

  return errors;
}

export function firstInvalidField(errors: ProfileErrors, role: Role): ProfileField | undefined {
  return fieldsForRole(role).find((field) => errors[field]);
}

function sameField(field: ProfileField, original: string, next: string): boolean {
  if (field === "businessPhone") return canonicalPhone(original) === canonicalPhone(next);
  return original.trim() === next.trim();
}

// Only the fields the person actually changed. Role is never included.
export function changedFields(original: ProfileFormValues, next: ProfileFormValues, role: Role): Partial<ProfileFormValues> {
  const patch: Partial<ProfileFormValues> = {};
  for (const field of fieldsForRole(role)) {
    if (!sameField(field, original[field], next[field])) patch[field] = next[field];
  }
  return patch;
}

export function isProfileDirty(original: ProfileFormValues, next: ProfileFormValues, role: Role): boolean {
  return Object.keys(changedFields(original, next, role)).length > 0;
}

export function isDistrict(value: string): value is District {
  return districtSet.has(value);
}

export function readEditablePatch(body: unknown): { ok: true; values: Partial<ProfileFormValues> } | { ok: false } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false };
  const record = body as Record<string, unknown>;
  const allowed = new Set<string>(EDITABLE_FIELDS);
  const values: Partial<ProfileFormValues> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!allowed.has(key) || typeof value !== "string") return { ok: false };
    values[key as ProfileField] = value;
  }
  return { ok: true, values };
}

export function mergeProfile(base: ProfileFormValues, patch: Partial<ProfileFormValues>, role: Role): ProfileFormValues {
  const next = { ...base };
  for (const field of fieldsForRole(role)) {
    if (patch[field] !== undefined) next[field] = patch[field];
  }
  return next;
}

// Columns written to profiles. Null description clears the text.
export function toDbPatch(patch: Partial<ProfileFormValues>): Record<string, string | null> | null {
  const db: Record<string, string | null> = {};
  if (patch.fullName !== undefined) db.full_name = patch.fullName.trim();
  if (patch.businessName !== undefined) db.business_name = patch.businessName.trim();
  if (patch.businessType !== undefined) db.business_type = patch.businessType;
  if (patch.description !== undefined) {
    const text = patch.description.trim();
    db.description = text ? text : null;
  }
  if (patch.district !== undefined) db.district = patch.district;
  if (patch.businessPhone !== undefined) {
    const phone = canonicalPhone(patch.businessPhone);
    if (!phone) return null;
    db.business_phone = phone;
  }
  return db;
}

export function validateRating(stars: unknown, comment: unknown): { stars?: "stars"; comment?: "commentLength" } | null {
  if (typeof comment !== "string") return { comment: "commentLength" };
  const errors: { stars?: "stars"; comment?: "commentLength" } = {};
  if (typeof stars !== "number" || !Number.isInteger(stars) || stars < 1 || stars > 5) errors.stars = "stars";
  if (textLength(comment.trim()) > 200) errors.comment = "commentLength";
  return Object.keys(errors).length ? errors : null;
}
