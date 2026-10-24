// Browser calls to the profile APIs.
// The access token is the signed-in session. Responses are mapped to codes, never raw errors.

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileErrors, ProfileField, ProfileFormValues } from "@/lib/profile/types";

export type ApiFailure = "auth" | "unavailable" | "save" | "validation" | "protected" | "roleFields" | "ai" | "rating" | "sameRole" | "self" | "network";

type FieldErrors = Partial<Record<ProfileField | "stars" | "comment", string>>;

async function authHeader(): Promise<Record<string, string> | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function send(path: string, method: string, body: unknown): Promise<{ status: number; data: unknown } | "network" | "unavailable" | "auth"> {
  const headers = await authHeader();
  if (headers === null) {
    return getSupabaseBrowserClient() ? "auth" : "unavailable";
  }
  try {
    const response = await fetch(path, { method, headers, body: JSON.stringify(body) });
    const data = (await response.json().catch(() => null)) as unknown;
    return { status: response.status, data };
  } catch {
    return "network";
  }
}

function failureFrom(result: { status: number; data: unknown } | "network" | "unavailable" | "auth"): ApiFailure {
  if (result === "network") return "network";
  if (result === "unavailable") return "unavailable";
  if (result === "auth") return "auth";
  if (!result.data || typeof result.data !== "object") return "save";
  const code = (result.data as { error?: unknown }).error;
  if (
    code === "auth" ||
    code === "unavailable" ||
    code === "save" ||
    code === "validation" ||
    code === "protected" ||
    code === "roleFields" ||
    code === "ai" ||
    code === "rating" ||
    code === "sameRole" ||
    code === "self"
  ) {
    return code;
  }
  if (result.status === 401) return "auth";
  if (result.status === 503) return "unavailable";
  return "save";
}

function fieldErrors(data: unknown): ProfileErrors | undefined {
  if (!data || typeof data !== "object") return undefined;
  const fields = (data as { fields?: FieldErrors }).fields;
  if (!fields || typeof fields !== "object") return undefined;
  const allowed = new Set(["name", "nameLength", "businessName", "businessNameLength", "businessType", "descriptionLength", "district", "businessPhone", "phoneFormat"]);
  const errors: ProfileErrors = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && allowed.has(value)) {
      errors[key as keyof ProfileErrors] = value as ProfileErrors[keyof ProfileErrors];
    }
  }
  return Object.keys(errors).length ? errors : undefined;
}

export async function saveProfile(patch: Partial<ProfileFormValues>): Promise<{ ok: true } | { ok: false; error: ApiFailure; fields?: ProfileErrors }> {
  const result = await send("/api/profile", "PATCH", patch);
  if (typeof result === "string" || result.status >= 400) {
    return { ok: false, error: failureFrom(result), fields: typeof result === "string" ? undefined : fieldErrors(result.data) };
  }
  return { ok: true };
}

export async function saveRating(rateeId: string, stars: number, comment: string): Promise<{ ok: true } | { ok: false; error: ApiFailure; fields?: { stars?: "stars"; comment?: "commentLength" } }> {
  const result = await send("/api/ratings", "POST", { rateeId, stars, comment });
  if (typeof result === "string" || result.status >= 400) {
    const data = typeof result === "string" ? null : result.data;
    const fields = data && typeof data === "object" ? (data as { fields?: { stars?: "stars"; comment?: "commentLength" } }).fields : undefined;
    return { ok: false, error: failureFrom(result), fields };
  }
  return { ok: true };
}

export async function improveDescription(text: string, language: string): Promise<{ ok: true; suggestion: string; mocked: boolean } | { ok: false; error: ApiFailure }> {
  const result = await send("/api/improve-description", "POST", { text, language });
  if (typeof result === "string" || result.status >= 400) return { ok: false, error: failureFrom(result) };
  const data = result.data as { suggestion?: unknown; mocked?: unknown } | null;
  if (!data || typeof data.suggestion !== "string" || !data.suggestion.trim()) return { ok: false, error: "ai" };
  return { ok: true, suggestion: data.suggestion, mocked: Boolean(data.mocked) };
}

export async function saveInterests(categoryIds: string[]): Promise<{ ok: true } | { ok: false; error: ApiFailure }> {
  const result = await send("/api/interests", "PUT", { categoryIds });
  if (typeof result === "string" || result.status >= 400) return { ok: false, error: failureFrom(result) };
  return { ok: true };
}
