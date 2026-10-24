// GET /api/workers?trade=&area=&id=   POST creates a worker after the user edits the draft.

import type { NextRequest } from "next/server";
import { createWorker, listWorkers } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/http";
import {
  cleanId,
  cleanLanguages,
  cleanPhone,
  cleanStringList,
  cleanText,
  cleanTrade,
  cleanYears,
  isRecord,
} from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const idText = params.get("id");
  const id = idText ? cleanId(idText) : undefined;
  if (idText && !id) return fail("Worker id must be a positive number.");
  const trade = cleanText(params.get("trade") ?? "", 40);
  const area = cleanText(params.get("area") ?? "", 80);
  if (trade && !cleanTrade(trade)) return fail("Unknown trade. Use tiler, painter, mason, electrician, plumber, or carpenter.");
  const workers = listWorkers({
    id: id ?? undefined,
    trade: trade || undefined,
    area: area || undefined,
  });
  return ok({ workers });
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body.");

  const name = cleanText(body.name, 80);
  const phone = cleanPhone(body.phone);
  const trade = cleanTrade(body.trade);
  const headline = cleanText(body.headline, 140);
  const summary = cleanText(body.summary, 800);
  const area = cleanText(body.area, 80);
  const raw = cleanText(body.raw_description, 4000);
  const years = cleanYears(body.years_experience);

  if (name.length < 2) return fail("Please add a name.");
  if (!phone) return fail("Enter a phone number with 9 to 15 digits.");
  if (!trade) return fail("Choose a trade: tiler, painter, mason, electrician, plumber, or carpenter.");
  if (headline.length < 3) return fail("Please add a short headline.");
  if (summary.length < 10) return fail("Please add a summary before saving.");
  if (area.length < 2) return fail("Please add an area, such as Colombo.");
  if (raw.length < 8) return fail("The original description is missing.");
  if (!years.ok) return fail("Years of experience must be a whole number from 0 to 60, or empty.");

  const worker = createWorker({
    name,
    phone,
    trade,
    headline,
    summary,
    skills: cleanStringList(body.skills, 12, 60),
    years_experience: years.value,
    area,
    languages: cleanLanguages(body.languages),
    raw_description: raw,
  });
  return ok({ worker }, 201);
}
