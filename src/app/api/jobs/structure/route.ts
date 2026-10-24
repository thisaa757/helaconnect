// Plain-language job text -> structured fields. Not saved until the customer confirms.

import type { NextRequest } from "next/server";
import { callAIJson, usingMockAi } from "@/lib/ai";
import { fail, ok, readBody } from "@/lib/http";
import { structureJob } from "@/lib/prompts";
import { cleanText, isRecord, normalizeJobDraft } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body with rawText.");
  const rawText = cleanText(body.rawText, 4000);
  if (rawText.length < 8) return fail("Please describe the job in a few words first.");

  try {
    const parsed = await callAIJson<unknown>(structureJob(rawText));
    const draft = normalizeJobDraft(parsed);
    return ok({ draft, mock: usingMockAi() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not structure that job.";
    return fail(message, 502);
  }
}
