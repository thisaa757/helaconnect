// POST /api/improve-description
// Rewrites the caller's own draft. The Gemini key stays in GEMINI_API_KEY on the server.
// The reply is a suggestion. The page does not save it unless the person accepts it.
//test

import { callAIJson, usingMockAi } from "@/lib/ai";
import { fail, ok, readBody } from "@/lib/http";
import { textLength } from "@/lib/profile/validate";
import { requireUser } from "@/lib/supabase/server";
import { isRecord } from "@/lib/types";
import type { Lang } from "@/lib/types";

const LANGUAGE_NAME: Record<Lang, string> = {
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
};

function clip(value: string): string {
  const tidy = value.replace(/\s+/g, " ").trim();
  return Array.from(tidy).slice(0, 400).join("").trim();
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return fail(auth.error, auth.status);

  const body = await readBody(request);
  if (!isRecord(body)) return fail("validation", 400);

  const language = body.language;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (language !== "en" && language !== "si" && language !== "ta") return fail("validation", 400);
  if (!text || textLength(text) > 400) return fail("validation", 400);

  const { data: profile, error } = await auth.client.from("profiles").select("role").eq("id", auth.userId).maybeSingle();
  if (error || (profile?.role !== "worker" && profile?.role !== "customer")) return fail("ai", 400);
  if (body.role !== undefined && body.role !== profile.role) return fail("validation", 400);

  const roleLine =
    profile.role === "worker"
      ? "an informal-sector worker describing their own work"
      : "a customer describing themselves and the kind of work they usually need";

  const prompt = `TASK: improveDescription
Return JSON only, with this shape: {"description":"..."}
The description must be at most 400 characters.

Rewrite the profile text for Hela-Connect in Sri Lanka.
The writer is ${roleLine}.
Write in ${LANGUAGE_NAME[language]} only.
Keep their meaning. Use plain, simple, friendly language.
Do not invent facts, qualifications, prices, years of experience, locations, or services they did not write.
Do not add phone numbers, promises, or claims.
No title and no explanation outside the JSON.

PROFILE_DESCRIPTION:
${text}`;

  try {
    const parsed = await callAIJson<{ description?: unknown }>(prompt);
    const suggestion = typeof parsed.description === "string" ? clip(parsed.description) : "";
    if (!suggestion) return fail("ai", 502);
    return ok({ suggestion, mocked: usingMockAi() });
  } catch {
    return fail("ai", 502);
  }
}
