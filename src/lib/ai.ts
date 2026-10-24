// One wrapper around Gemini. Swap the provider by editing this file only.
// If GEMINI_API_KEY is missing, every call returns a clearly labelled mock.

import type { PriceGuide, Trade, WorkerDraft } from "./types";

type RankItem = { worker_id: number; score: number; reason: string };

const TRADE_WORDS: { trade: Trade; words: string[] }[] = [
  { trade: "electrician", words: ["electric", "wiring", "විදුලි", "மின்"] },
  { trade: "plumber", words: ["plumb", "pipe", "leak", "නල", "පයිප්", "குழாய்", "பிளம்பர்"] },
  { trade: "carpenter", words: ["carpent", "cupboard", "වඩු", "தச்ச"] },
  { trade: "tiler", words: ["tiler", "tile", "ටයිල්", "ஓடு"] },
  { trade: "painter", words: ["paint", "තීන්ත", "பெயிண்ட்", "வண்ண"] },
  { trade: "mason", words: ["mason", "brick", "plaster", "මේසන්", "கொத்த"] },
];

const AREA_WORDS: { area: string; words: string[] }[] = [
  { area: "Colombo", words: ["colombo", "කොළඹ", "கொழும்பு"] },
  { area: "Kandy", words: ["kandy", "මහනුවර", "கண்டி"] },
  { area: "Galle", words: ["galle", "ගාල්ල", "காலி"] },
  { area: "Jaffna", words: ["jaffna", "යාපනය", "யாழ்ப்பாணம்"] },
  { area: "Negombo", words: ["negombo", "මීගමුව", "நீர்கொழும்பு"] },
];

export function usingMockAi(): boolean {
  return !process.env.GEMINI_API_KEY?.trim();
}

export async function callAI(prompt: string): Promise<string> {
  if (usingMockAi()) return mockText(prompt);

  const model = process.env.GEMINI_MODEL?.trim();
  if (!model) {
    throw new Error("GEMINI_MODEL is empty. Add it to .env.local. This app does not hardcode a model name.");
  }

  const key = process.env.GEMINI_API_KEY!.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });
  } catch {
    throw new Error("Could not reach Gemini. Check the network and try again.");
  }

  const data = (await response.json().catch(() => null)) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  } | null;

  if (!response.ok) {
    const message = data?.error?.message || `Gemini request failed (${response.status}).`;
    throw new Error(message.replace(/key=[^&\s]+/gi, "key=***"));
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
    throw new Error(reason ? `Gemini returned no text (${reason}).` : "Gemini returned no text.");
  }
  return text;
}

// Parse JSON. If parsing fails, ask the model once more.
export async function callAIJson<T>(prompt: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const promptToSend =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous reply was not valid JSON. Reply again with JSON only, no markdown.`;
    try {
      const text = await callAI(promptToSend);
      return parseModelJson<T>(text);
    } catch (error) {
      lastError = error;
    }
  }
  const detail = lastError instanceof Error ? lastError.message : "Unknown parse error";
  throw new Error(`The AI reply was not valid JSON. Please try again. ${detail}`);
}

function parseModelJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? trimmed).trim();
  const firstObject = body.indexOf("{");
  const firstArray = body.indexOf("[");
  let start = -1;
  let end = -1;
  if (firstArray >= 0 && (firstObject < 0 || firstArray < firstObject)) {
    start = firstArray;
    end = body.lastIndexOf("]");
  } else if (firstObject >= 0) {
    start = firstObject;
    end = body.lastIndexOf("}");
  }
  if (start < 0 || end <= start) throw new Error("No JSON found in the model reply.");
  return JSON.parse(body.slice(start, end + 1)) as T;
}

function mockText(prompt: string): string {
  if (prompt.includes("TASK: generateWorkerProfile")) return JSON.stringify(mockProfile(section(prompt, "DESCRIPTION:")));
  if (prompt.includes("TASK: structureJob")) return JSON.stringify(mockJob(section(prompt, "JOB_TEXT:")));
  if (prompt.includes("TASK: rankWorkers")) return JSON.stringify(mockRank(prompt));
  if (prompt.includes("TASK: estimatePriceRange")) return JSON.stringify(mockPrice(prompt));
  return "[MOCK — GEMINI_API_KEY is not set] This is a stand-in answer so the demo can run without a private key.";
}

function section(prompt: string, label: string): string {
  const at = prompt.lastIndexOf(label);
  if (at < 0) return "";
  return prompt.slice(at + label.length).trim();
}

function findTrade(text: string): Trade | null {
  const hay = text.toLowerCase();
  return TRADE_WORDS.find((item) => item.words.some((word) => hay.includes(word.toLowerCase())))?.trade ?? null;
}

function findArea(text: string): string | null {
  const hay = text.toLowerCase();
  return AREA_WORDS.find((item) => item.words.some((word) => hay.includes(word.toLowerCase())))?.area ?? null;
}

function findYears(text: string): number | null {
  const after = text.match(/(\d{1,2})\s*(years?|yrs?|අවුරුදු|வருட|ஆண்டு)/i);
  const before = text.match(/(years?|yrs?|අවුරුදු|வருட|ஆண்டு)\D{0,8}(\d{1,2})/i);
  const raw = after?.[1] ?? before?.[2];
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 60) return null;
  return n;
}

function findLanguages(text: string): string[] {
  const languages: string[] = [];
  if (/[\u0D80-\u0DFF]/.test(text) || /sinhala|සිංහල/i.test(text)) languages.push("Sinhala");
  if (/[\u0B80-\u0BFF]/.test(text) || /tamil|தமிழ்/i.test(text)) languages.push("Tamil");
  if (/[A-Za-z]{3,}/.test(text) || /english|ඉංග්‍රීසි|ஆங்கிலம்/i.test(text)) languages.push("English");
  return languages;
}

function mockProfile(text: string): WorkerDraft {
  const trade = findTrade(text);
  const area = findArea(text);
  const years = findYears(text);
  const skills = trade ? [trade === "electrician" ? "electrical work" : trade === "plumber" ? "plumbing" : trade === "carpenter" ? "carpentry" : trade === "tiler" ? "tiling" : trade === "painter" ? "painting" : "masonry"] : [];
  const place = area ? `the place they named is ${area}` : "no area was stated";
  const time = years !== null ? `they stated ${years} years` : "years of experience were not stated";
  return {
    name: null,
    trade,
    headline: trade ? `[MOCK] ${trade[0].toUpperCase()}${trade.slice(1)}${area ? ` in ${area}` : ""}` : null,
    summary: `[MOCK] GEMINI_API_KEY is not set, so this draft only uses words found in the description. ${trade ? `They described ${trade} work.` : "No trade was stated."} ${place[0].toUpperCase()}${place.slice(1)}, and ${time}.`,
    skills,
    years_experience: years,
    area,
    languages: findLanguages(text),
  };
}

function findTimeframe(text: string): string | null {
  const within = text.match(/within\s+\d+\s+(?:day|days|week|weeks|month|months)/i);
  if (within) return within[0];
  if (/this week/i.test(text)) return "this week";
  if (/this month/i.test(text)) return "this month";
  const count = text.match(/(\d+)\s*(?:weeks?|months?|days?|සති|வார|மாத)/i);
  return count ? count[0] : null;
}

function findSize(text: string): string | null {
  const by = text.match(/\d+\s*(?:by|x|×)\s*\d+(?:\s*(?:feet|ft|අඩි|அடி))?/i);
  if (by) return by[0];
  const rooms = text.match(/(?:one|two|three|four|\d+)\s+(?:bedrooms?|rooms?|bathrooms?)/i);
  if (rooms) return rooms[0];
  if (/bathroom|නාන කාමර|குளியலறை/i.test(text)) return "bathroom";
  return null;
}

function mockJob(text: string) {
  const trade = findTrade(text);
  const area = findArea(text);
  const size = findSize(text);
  const timeframe = findTimeframe(text);
  const missing: string[] = [];
  if (!trade) missing.push("What trade is needed?");
  if (!area) missing.push("Which city or area?");
  if (!timeframe) missing.push("When should the work be done?");
  if (!size) missing.push("How big is the job?");
  return {
    trade,
    area,
    size_estimate: size,
    timeframe,
    summary: `[MOCK] GEMINI_API_KEY is not set. ${trade ? `Trade looks like ${trade}.` : "No trade was detected."} ${area ? `Area looks like ${area}.` : "No area was detected."} ${size ? `Size mentioned: ${size}.` : ""} ${timeframe ? `Time mentioned: ${timeframe}.` : ""}`.replace(/\s+/g, " ").trim(),
    missing_info: missing,
  };
}

function mockRank(prompt: string): RankItem[] {
  const jobPart = prompt.split("CANDIDATES_JSON:")[0] ?? "";
  const job = readJsonBlock<Record<string, unknown>>(section(jobPart, "JOB_JSON:"));
  const candidates = readJsonBlock<Record<string, unknown>[]>(section(prompt, "CANDIDATES_JSON:")) ?? [];
  const jobText = `${String(job?.summary ?? "")} ${String(job?.raw_text ?? "")}`.toLowerCase();

  return candidates
    .map((candidate) => {
      const workerId = Number(candidate.worker_id);
      const trade = String(candidate.trade ?? "");
      const area = String(candidate.area ?? "");
      const years = typeof candidate.years_experience === "number" ? candidate.years_experience : null;
      const skills = Array.isArray(candidate.skills) ? candidate.skills.map(String) : [];
      let score = 20;
      const bits: string[] = [];
      if (trade && trade === job?.trade) {
        score += 40;
        bits.push(`${trade} trade`);
      }
      if (area && area === job?.area) {
        score += 20;
        bits.push(`${area}`);
      }
      if (years !== null) {
        score += Math.min(years, 10);
        bits.push(`${years} years`);
      }
      const skillHit = skills.find((skill) =>
        skill
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 3)
          .some((word) => jobText.includes(word)),
      );
      if (skillHit) {
        score += 15;
        bits.push(`skill "${skillHit}"`);
      }
      return {
        worker_id: workerId,
        score: Math.max(0, Math.min(100, score)),
        reason: `[MOCK] Matched on ${bits.join(", ") || "the profile"}. GEMINI_API_KEY is not set.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function mockPrice(prompt: string): PriceGuide {
  const job = readJsonBlock<Record<string, unknown>>(section(prompt, "JOB_JSON:"));
  const ranges: Record<string, [number, number]> = {
    tiler: [15000, 45000],
    painter: [12000, 40000],
    mason: [20000, 80000],
    electrician: [8000, 35000],
    plumber: [5000, 25000],
    carpenter: [15000, 60000],
  };
  const range = ranges[String(job?.trade ?? "")] ?? [10000, 50000];
  return {
    low: range[0],
    high: range[1],
    currency: "LKR",
    note: "[MOCK] Rough guide only. GEMINI_API_KEY is not set. Not a professional quote.",
  };
}

function readJsonBlock<T>(text: string): T | null {
  try {
    return parseModelJson<T>(text);
  } catch {
    return null;
  }
}
