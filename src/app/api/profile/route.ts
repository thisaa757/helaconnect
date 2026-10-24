// PATCH /api/profile
// Checks the signed-in person, then writes only editable columns that changed.
// Role, ratings, email, and personal phone are never accepted from the client.

import { fail, ok, readBody } from "@/lib/http";
import { mergeProfile, profileToForm, readEditablePatch, toDbPatch, validateProfile } from "@/lib/profile/validate";
import type { ProfileErrors, ProfileFormValues } from "@/lib/profile/types";
import { requireUser } from "@/lib/supabase/server";
import type { Role } from "@/lib/signup/validate";
import { isRecord } from "@/lib/types";

const CUSTOMER_FIELDS = new Set(["fullName", "description", "district"]);

function friendlyDb(message: string): { error: "protected" | "roleFields" | "save" } | { error: "validation"; fields: ProfileErrors } {
  if (message.includes("profile_protected_column") || message.includes("permission denied")) return { error: "protected" };
  if (message.includes("profile_customer_business")) return { error: "roleFields" };
  if (message.includes("profiles_description_length")) return { error: "validation", fields: { description: "descriptionLength" } };
  if (message.includes("profile_business_type")) return { error: "validation", fields: { businessType: "businessType" } };
  if (message.includes("profile_phone_format")) return { error: "validation", fields: { businessPhone: "phoneFormat" } };
  if (message.includes("profiles_district_check")) return { error: "validation", fields: { district: "district" } };
  if (message.includes("profiles_worker_details")) return { error: "validation", fields: { businessName: "businessName" } };
  return { error: "save" };
}

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return fail(auth.error, auth.status);

  const body = await readBody(request);
  if (!isRecord(body)) return fail("validation", 400);
  const parsed = readEditablePatch(body);
  if (!parsed.ok) return fail("protected", 400);
  if (Object.keys(parsed.values).length === 0) return ok({ ok: true });

  const { data: row, error: readError } = await auth.client
    .from("profiles")
    .select("role, full_name, business_name, business_type, description, district, business_phone")
    .eq("id", auth.userId)
    .maybeSingle();

  if (readError || !row || (row.role !== "worker" && row.role !== "customer")) return fail("save", 400);
  const role = row.role as Role;

  if (role === "customer" && Object.keys(parsed.values).some((key) => !CUSTOMER_FIELDS.has(key))) {
    return fail("roleFields", 400);
  }

  const current: ProfileFormValues = profileToForm({
    id: auth.userId,
    fullName: row.full_name ?? "",
    role,
    district: row.district ?? "",
    businessName: row.business_name,
    businessPhone: row.business_phone,
    businessType: row.business_type,
    description: row.description,
    language: "",
    createdAt: "",
  });

  const merged = mergeProfile(current, parsed.values, role);
  const errors = validateProfile(merged, role);
  if (Object.keys(errors).length > 0) return fail("validation", 400, errors);

  const db = toDbPatch(parsed.values);
  if (!db) return fail("validation", 400);
  if (Object.keys(db).length === 0) return ok({ ok: true });

  const { error: updateError } = await auth.client.from("profiles").update(db).eq("id", auth.userId);
  if (updateError) {
    const mapped = friendlyDb(updateError.message ?? "");
    if (mapped.error === "validation") return fail("validation", 400, mapped.fields);
    return fail(mapped.error, 400);
  }

  return ok({ ok: true });
}
