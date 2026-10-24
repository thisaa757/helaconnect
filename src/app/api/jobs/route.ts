// GET /api/jobs or /api/jobs?id=1. POST saves a job the customer has confirmed.

import type { NextRequest } from "next/server";
import { createJob, listJobs } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/http";
import { cleanId, cleanText, cleanTrade, isRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const idText = request.nextUrl.searchParams.get("id");
  if (!idText) return ok({ jobs: listJobs() });
  const id = cleanId(idText);
  if (!id) return fail("Job id must be a positive number.");
  return ok({ jobs: listJobs(id) });
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body.");

  const customerName = cleanText(body.customer_name, 80);
  const rawText = cleanText(body.raw_text, 4000);
  const trade = cleanTrade(body.trade);
  const area = cleanText(body.area, 80);
  const summary = cleanText(body.summary, 500);
  const size = cleanText(body.size_estimate, 120) || null;
  const timeframe = cleanText(body.timeframe, 120) || null;

  if (customerName.length < 2) return fail("Please add your name.");
  if (rawText.length < 8) return fail("The original job text is missing.");
  if (!trade) return fail("Choose a trade before saving the job.");
  if (area.length < 2) return fail("Please add an area, such as Colombo.");
  if (summary.length < 8) return fail("Please keep a short summary before saving.");

  const job = createJob({
    customer_name: customerName,
    raw_text: rawText,
    trade,
    area,
    size_estimate: size,
    timeframe,
    summary,
  });
  return ok({ job }, 201);
}
