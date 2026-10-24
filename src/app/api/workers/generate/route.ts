// Turns a raw description into a profile draft. Nothing is saved here.

import type { NextRequest } from "next/server";
import { callAIJson, usingMockAi } from "@/lib/ai";
import { fail, ok, readBody } from "@/lib/http";
import { generateWorkerProfile } from "@/lib/prompts";
import { cleanText, isRecord, normalizeWorkerDraft } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body with rawText.");
  const rawText = cleanText(body.rawText, 4000);
  if (rawText.length < 8) return fail("Please describe the work in a few words first.");

  try {
    const parsed = await callAIJson<unknown>(generateWorkerProfile(rawText));
    const draft = normalizeWorkerDraft(parsed);
    return ok({ draft, mock: usingMockAi() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The profile draft failed.";
    return fail(message, 502);
  }
}
