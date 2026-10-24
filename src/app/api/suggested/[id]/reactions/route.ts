// POST /api/suggested/:id/reactions. Toggles like or interested for one identity.
// The unique (job, actor, reaction) constraint blocks duplicate rows.

import type { NextRequest } from "next/server";
import { getJob, toggleFeedReaction, type FeedReaction } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/http";
import { denyFeed, isFeedIdentity, resolveFeedAccess } from "@/lib/suggested/access";
import { cleanId, isRecord } from "@/lib/types";

function cleanReaction(value: unknown): FeedReaction | null {
  return value === "like" || value === "interested" ? value : null;
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
  const reaction = cleanReaction(body.reaction);
  if (!reaction) return fail("Choose like or interested.");

  try {
    const summary = toggleFeedReaction(id, access.actorKey, reaction);
    return ok({ reactions: summary });
  } catch {
    return fail("The reaction could not be saved.", 500);
  }
}
