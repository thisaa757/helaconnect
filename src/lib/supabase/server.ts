// Server-side Supabase client for the signed-in person.
// Uses the anon key plus that person's access token, so row level security still applies.
// The service role key is never read here.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true; userId: string; client: SupabaseClient }
  | { ok: false; status: 401 | 503; error: "auth" | "unavailable" };

function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match?.[1] ?? null;
}

export async function requireUser(request: Request): Promise<AuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = readBearer(request);
  if (!url || !anonKey) return { ok: false, status: 503, error: "unavailable" };
  if (!token) return { ok: false, status: 401, error: "auth" };

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return { ok: false, status: 401, error: "auth" };
  return { ok: true, userId: data.user.id, client };
}
