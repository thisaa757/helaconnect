// SQL keeps workers with the same trade and area.
// The model only ranks those people, then we drop any id it was not given.

import type { NextRequest } from "next/server";
import { callAIJson, usingMockAi } from "@/lib/ai";
import { getJob, workersForMatch } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { estimatePriceRange, rankWorkers } from "@/lib/prompts";
import { cleanId, cleanText, cleanTrade, isRecord, normalizePrice, type RankedMatch } from "@/lib/types";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = cleanId(rawId);
  if (!id) return fail("Job id must be a positive number.");
  const job = getJob(id);
  if (!job) return fail("That job was not found.", 404);

  const trade = cleanTrade(job.trade);
  if (!trade) return fail("This job has no trade, so it cannot be matched.");

  const candidates = workersForMatch(trade, job.area);
  const price = await priceGuide(job);

  if (candidates.length === 0) {
    return ok({ matches: [], price_guide: price, mock: usingMockAi() });
  }

  const payload = candidates.map((worker) => ({
    worker_id: worker.id,
    trade: worker.trade,
    area: worker.area,
    years_experience: worker.years_experience,
    skills: worker.skills,
    headline: worker.headline,
    summary: worker.summary,
    languages: worker.languages,
  }));

  try {
    const parsed = await callAIJson<unknown>(rankWorkers(job, payload));
    const allowed = new Map(candidates.map((worker) => [worker.id, worker]));
    const matches = readRanks(parsed, allowed);
    return ok({ matches, price_guide: price, mock: usingMockAi() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Matching failed.";
    return fail(message, 502);
  }
}

async function priceGuide(job: NonNullable<ReturnType<typeof getJob>>) {
  try {
    const parsed = await callAIJson<unknown>(estimatePriceRange(job));
    return normalizePrice(parsed);
  } catch {
    return null;
  }
}

function readRanks(value: unknown, allowed: Map<number, RankedMatch["worker"]>): RankedMatch[] {
  const list = asList(value);
  const seen = new Set<number>();
  const matches: RankedMatch[] = [];
  for (const item of list) {
    if (!isRecord(item)) continue;
    const workerId = Number(item.worker_id);
    const worker = allowed.get(workerId);
    if (!worker || seen.has(workerId)) continue;
    const score = Math.max(0, Math.min(100, Math.round(Number(item.score))));
    const reason = cleanText(item.reason, 300);
    if (!Number.isFinite(score) || !reason) continue;
    seen.add(workerId);
    matches.push({ worker_id: workerId, score, reason, worker });
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      if (Array.isArray(item)) return item;
    }
  }
  throw new Error("The matcher did not return a JSON list.");
}
