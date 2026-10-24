// Creates a request from a customer job to one worker.
// GET ?workerId= is the demo inbox. Status always starts as pending.

import type { NextRequest } from "next/server";
import { createRequest, findRequest, getJob, getWorker, listRequestsForWorker } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/http";
import { cleanId, isRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const workerId = cleanId(request.nextUrl.searchParams.get("workerId"));
  if (!workerId) return fail("Choose a worker. This demo has no login, so pass workerId.");
  if (!getWorker(workerId)) return fail("That worker was not found.", 404);
  return ok({ requests: listRequestsForWorker(workerId) });
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (!isRecord(body)) return fail("Send a JSON body with job_id and worker_id.");
  const jobId = cleanId(body.job_id);
  const workerId = cleanId(body.worker_id);
  if (!jobId || !workerId) return fail("job_id and worker_id must be positive numbers.");
  if (!getJob(jobId)) return fail("That job was not found.", 404);
  if (!getWorker(workerId)) return fail("That worker was not found.", 404);

  const existing = findRequest(jobId, workerId);
  if (existing) return ok({ request: existing, already: true });

  const created = createRequest(jobId, workerId);
  return ok({ request: created, already: false }, 201);
}
