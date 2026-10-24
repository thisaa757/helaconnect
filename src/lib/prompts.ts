// All Gemini prompts live here so a judge can read them in one file.
// Every prompt asks for JSON only.

import type { Trade } from "./types";

const tradeList: Trade[] = ["tiler", "painter", "mason", "electrician", "plumber", "carpenter"];

export function generateWorkerProfile(rawText: string): string {
  return `TASK: generateWorkerProfile
You write a hireable profile for an informal tradesperson in Sri Lanka.
The description may be Sinhala, Tamil, or English.

Return JSON only. No markdown. No prose outside the JSON.
Use this shape:
{
  "name": string | null,
  "trade": ${JSON.stringify(tradeList)} or null,
  "headline": string | null,
  "summary": string | null,
  "skills": string[],
  "years_experience": number | null,
  "area": string | null,
  "languages": string[]
}

Rules:
- Never invent facts that were not stated. Unknown fields must be null. Unknown lists must be [].
- summary: up to 3 short professional sentences in English. Use only stated facts. If a fact is missing, say it was not stated instead of guessing.
- headline: one short English line, or null.
- skills: English phrases for skills they actually mentioned.
- languages: only "Sinhala", "Tamil", or "English", and only if they named that language or wrote in it.
- years_experience: a whole number, or null. Do not guess.
- area: the place they named, or null. Do not guess a city.
- trade: one of the listed values, or null.

DESCRIPTION:
${rawText}`;
}

export function structureJob(rawText: string): string {
  return `TASK: structureJob
A customer in Sri Lanka described a job in plain language.
The text may be Sinhala, Tamil, or English.

Return JSON only. No markdown.
Use this shape:
{
  "trade": ${JSON.stringify(tradeList)} or null,
  "area": string | null,
  "size_estimate": string | null,
  "timeframe": string | null,
  "summary": string | null,
  "missing_info": string[]
}

Rules:
- Never invent facts. Use null when something was not stated.
- summary: 1 or 2 sentences in English, using only stated facts.
- size_estimate and timeframe: short English phrases copied from what they said, or null.
- area: the place name they used. Prefer the city if they named one.
- missing_info: short English questions for important gaps (trade, area, size, timeframe). [] if nothing important is missing.
- trade: one of the listed values, or null.

JOB_TEXT:
${rawText}`;
}

export function rankWorkers(job: unknown, candidates: unknown): string {
  return `TASK: rankWorkers
Rank these tradespeople for the job. Return a JSON array only. No markdown.
Each item must be:
{"worker_id": number, "score": number, "reason": string}

Rules:
- score is an integer from 0 to 100.
- reason is one sentence. Name the specific skill, area, or years of experience that matched.
- Use only worker_id values from the candidates. Do not invent a worker.
- Best match first. At most 5 people.
- Do not mention skills or experience that are not in the candidate data.

JOB_JSON:
${JSON.stringify(job)}

CANDIDATES_JSON:
${JSON.stringify(candidates)}`;
}

export function estimatePriceRange(job: unknown): string {
  return `TASK: estimatePriceRange
Give a rough Sri Lankan rupee range for this job. This is a guide for a demo, not a quote.

Return JSON only. No markdown.
Use this shape:
{"low": number, "high": number, "currency": "LKR", "note": string}

Rules:
- currency must be "LKR".
- low and high are whole numbers. high must be greater than or equal to low.
- If details are missing, widen the range.
- note must say this is a rough guide and not a professional quote.
- Do not invent materials or room counts that were not stated.

JOB_JSON:
${JSON.stringify(job)}`;
}
