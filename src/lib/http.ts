// Every API route replies through these two helpers.
// The browser never receives the Gemini key.

import { NextResponse } from "next/server";

const noStore = { "Cache-Control": "no-store" };

export function ok(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

export function fail(message: string, status = 400, fields?: unknown) {
  const body = fields ? { error: message, fields } : { error: message };
  return NextResponse.json(body, { status, headers: noStore });
}

export async function readBody(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
