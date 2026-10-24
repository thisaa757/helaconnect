// POST /api/suggested/:id/comments. Saves one comment on a job in SQLite.

import type { NextRequest } from "next/server";
import { addFeedComment, getJob } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/http";
import { denyFeed, isFeedIdentity, resolveFeedAccess } from "@/lib/suggested/access";
import { cleanId, isRecord } from "@/lib/types";

const MAX_COMMENT = 400;

function commentText(value: unknown): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof value !== "string") return { ok: false, error: "Write a comment before posting." };
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!text) return { ok: false, error: "Write a comment before posting." };
  if (Array.from(text).length > MAX_COMMENT) return { ok: false, error: "Use 400 characters or fewer." };
  return { ok: true, text };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await resolveFeedAccess(request);
  if (!isFeedIdentity(access)) return denyFeed(access);

  const { id: rawId } = await params;
  const id = cleanId(rawId);
  if (!id) return fail("Job id must be a positive number.");
  if (!getJob(id)) return fail("That job was not found.", 404);

  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body.");
  const text = commentText(body.text);
  if (!text.ok) return fail(text.error);

  try {
    const comment = addFeedComment(id, access.actorKey, access.displayName, text.text);
    return ok({ comment: { id: comment.id, author_name: comment.author_name, body: comment.body, created_at: comment.created_at } }, 201);
  } catch {
    return fail("The comment could not be saved.", 500);
  }
}
