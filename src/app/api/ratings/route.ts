// POST /api/ratings
// The rater is always the signed-in person. Stars and an optional comment can be updated later.
// The database trigger also rejects self ratings and same-role ratings.

import { fail, ok, readBody } from "@/lib/http";
import { isUuid, validateRating } from "@/lib/profile/validate";
import { requireUser } from "@/lib/supabase/server";
import { isRecord } from "@/lib/types";

const ALLOWED = new Set(["rateeId", "stars", "comment"]);

function friendlyDb(message: string): "sameRole" | "self" | "rating" {
  if (message.includes("rating_self")) return "self";
  if (message.includes("rating_same_role") || message.includes("rating_missing_profile")) return "sameRole";
  return "rating";
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return fail(auth.error, auth.status);

  const body = await readBody(request);
  if (!isRecord(body) || Object.keys(body).some((key) => !ALLOWED.has(key))) return fail("validation", 400);

  const rateeId = typeof body.rateeId === "string" ? body.rateeId : "";
  const comment = typeof body.comment === "string" ? body.comment : "";
  if (!isUuid(rateeId)) return fail("rating", 400);
  const errors = validateRating(body.stars, comment);
  if (errors) return fail("validation", 400, errors);
  if (rateeId === auth.userId) return fail("self", 400);

  const [{ data: rater, error: raterError }, { data: ratee, error: rateeError }] = await Promise.all([
    auth.client.from("profiles").select("role").eq("id", auth.userId).maybeSingle(),
    auth.client.from("public_profiles").select("role").eq("id", rateeId).maybeSingle(),
  ]);

  if (raterError || rateeError) return fail("rating", 400);
  if (!rater || !ratee) return fail("sameRole", 400);
  if (rater.role === ratee.role) return fail("sameRole", 400);

  const { error } = await auth.client.from("ratings").upsert(
    {
      rater_id: auth.userId,
      ratee_id: rateeId,
      stars: body.stars,
      comment: comment.trim() ? comment.trim() : null,
    },
    { onConflict: "rater_id,ratee_id" },
  );

  if (error) return fail(friendlyDb(error.message ?? ""), 400);
  return ok({ ok: true });
}
