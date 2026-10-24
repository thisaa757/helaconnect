// Shared shapes for workers, jobs, matches, and requests.
// Also the small input cleaners every API route uses.

export type Lang = "en" | "si" | "ta";

export const TRADES = [
  "tiler",
  "painter",
  "mason",
  "electrician",
  "plumber",
  "carpenter",
] as const;

export type Trade = (typeof TRADES)[number];

export const AREAS = ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo"] as const;

export const SPOKEN = ["Sinhala", "Tamil", "English"] as const;

export type WorkerPhoto = {
  id: number;
  worker_id: number;
  path: string;
};

export type Review = {
  id: number;
  worker_id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
};

export type Worker = {
  id: number;
  name: string;
  phone: string;
  trade: string;
  headline: string;
  summary: string;
  skills: string[];
  years_experience: number | null;
  area: string;
  languages: string[];
  raw_description: string;
  created_at: string;
  photos: WorkerPhoto[];
  reviews?: Review[];
};

export type WorkerDraft = {
  name: string | null;
  trade: Trade | null;
  headline: string | null;
  summary: string | null;
  skills: string[];
  years_experience: number | null;
  area: string | null;
  languages: string[];
};

export type NewWorker = {
  name: string;
  phone: string;
  trade: Trade;
  headline: string;
  summary: string;
  skills: string[];
  years_experience: number | null;
  area: string;
  languages: string[];
  raw_description: string;
};

export type Job = {
  id: number;
  customer_name: string;
  raw_text: string;
  trade: string;
  area: string;
  size_estimate: string | null;
  timeframe: string | null;
  summary: string;
  created_at: string;
};

export type JobDraft = {
  trade: Trade | null;
  area: string | null;
  size_estimate: string | null;
  timeframe: string | null;
  summary: string | null;
  missing_info: string[];
};

export type NewJob = {
  customer_name: string;
  raw_text: string;
  trade: Trade;
  area: string;
  size_estimate: string | null;
  timeframe: string | null;
  summary: string;
};

export type RankedMatch = {
  worker_id: number;
  score: number;
  reason: string;
  worker: Worker;
};

export type PriceGuide = {
  low: number;
  high: number;
  currency: "LKR";
  note: string;
};

export type WorkRequest = {
  id: number;
  job_id: number;
  worker_id: number;
  status: string;
  created_at: string;
  customer_name?: string;
  summary?: string;
  trade?: string;
  area?: string;
  timeframe?: string | null;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Strip control characters and cap length. Keeps Sinhala and Tamil letters.
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function cleanId(value: unknown): number | null {
  const text = typeof value === "number" ? String(value) : cleanText(value, 12);
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function cleanPhone(value: unknown): string | null {
  const text = cleanText(value, 20);
  const digits = text.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return null;
  return text;
}

export function cleanTrade(value: unknown): Trade | null {
  const text = cleanText(value, 40).toLowerCase();
  return (TRADES as readonly string[]).includes(text) ? (text as Trade) : null;
}

export function cleanStringList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const text = cleanText(item, maxLen);
    if (!text) continue;
    if (!out.includes(text)) out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  sinhala: "Sinhala",
  si: "Sinhala",
  සිංහල: "Sinhala",
  tamil: "Tamil",
  ta: "Tamil",
  தமிழ்: "Tamil",
  english: "English",
  en: "English",
  ඉංග්‍රීසි: "English",
  ஆங்கிலம்: "English",
};

export function cleanLanguages(value: unknown): string[] {
  return cleanStringList(value, 4, 30).map((item) => LANGUAGE_ALIASES[item] ?? LANGUAGE_ALIASES[item.toLowerCase()] ?? item);
}

export function cleanYears(value: unknown): { ok: true; value: number | null } | { ok: false } {
  if (value === null || value === undefined || value === "") return { ok: true, value: null };
  const n = typeof value === "number" ? value : Number(cleanText(value, 4));
  if (!Number.isInteger(n) || n < 0 || n > 60) return { ok: false };
  return { ok: true, value: n };
}

export function normalizeWorkerDraft(value: unknown): WorkerDraft {
  if (!isRecord(value)) throw new Error("The AI profile was not a JSON object.");
  const years = cleanYears(value.years_experience);
  return {
    name: cleanText(value.name, 80) || null,
    trade: cleanTrade(value.trade),
    headline: cleanText(value.headline, 140) || null,
    summary: cleanText(value.summary, 800) || null,
    skills: cleanStringList(value.skills, 12, 60),
    years_experience: years.ok ? years.value : null,
    area: cleanText(value.area, 80) || null,
    languages: cleanLanguages(value.languages),
  };
}

export function normalizeJobDraft(value: unknown): JobDraft {
  if (!isRecord(value)) throw new Error("The structured job was not a JSON object.");
  return {
    trade: cleanTrade(value.trade),
    area: cleanText(value.area, 80) || null,
    size_estimate: cleanText(value.size_estimate, 120) || null,
    timeframe: cleanText(value.timeframe, 120) || null,
    summary: cleanText(value.summary, 500) || null,
    missing_info: cleanStringList(value.missing_info, 6, 160),
  };
}

export function normalizePrice(value: unknown): PriceGuide | null {
  if (!isRecord(value)) return null;
  const low = Number(value.low);
  const high = Number(value.high);
  if (!Number.isFinite(low) || !Number.isFinite(high) || low < 0 || high < 0) return null;
  const note = cleanText(value.note, 300) || "Rough guide only. Not a professional quote.";
  const orderedLow = Math.round(Math.min(low, high));
  const orderedHigh = Math.round(Math.max(low, high));
  return {
    low: orderedLow,
    high: orderedHigh,
    currency: "LKR",
    note: /rough guide/i.test(note) ? note : `${note} Rough guide only, not a quote.`,
  };
}

export async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
  if (!data) throw new Error("The server sent an empty response.");
  return data;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
