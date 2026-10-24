// PUT /api/interests
// Replaces the signed-in person's interest chips. Only known category ids are accepted.

import { isCategoryId } from "@/lib/categories";
import { fail, ok, readBody } from "@/lib/http";
import { requireUser } from "@/lib/supabase/server";
import { isRecord } from "@/lib/types";

export async function PUT(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return fail(auth.error, auth.status);

  const body = await readBody(request);
  if (!isRecord(body) || !Array.isArray(body.categoryIds)) return fail("validation", 400);
  if (body.categoryIds.some((id) => typeof id !== "string" || !isCategoryId(id))) return fail("validation", 400);

  const ids = [...new Set(body.categoryIds as string[])];
  const { data: existing, error: readError } = await auth.client
    .from("profile_interests")
    .select("category_id")
    .eq("user_id", auth.userId);

  if (readError) return fail("save", 400);

  const existingIds = new Set(((existing ?? []) as { category_id: string }[]).map((row) => row.category_id));
  const remove = [...existingIds].filter((id) => !ids.includes(id));
  const add = ids.filter((id) => !existingIds.has(id));

  if (remove.length > 0) {
    const { error } = await auth.client.from("profile_interests").delete().eq("user_id", auth.userId).in("category_id", remove);
    if (error) return fail("save", 400);
  }

  if (add.length > 0) {
    const { error } = await auth.client.from("profile_interests").insert(add.map((category_id) => ({ user_id: auth.userId, category_id })));
    if (error) return fail("save", 400);
  }

  return ok({ ok: true });
}
