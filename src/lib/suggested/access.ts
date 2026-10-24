// Decides who may use the suggested-job feed.
// A Supabase session with a worker profile is a real account.
// Without that session, the demo role and demo key are only a labelled preview.
// A value from the browser does not prove who the person is.

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { cleanText } from "@/lib/types";

export type FeedIdentity = {
  access: "authenticated" | "demo";
  role: "worker";
  actorKey: string;
  displayName: string;
};

export type FeedDenial = {
  status: 400 | 401 | 403 | 503;
  error: string;
  access: "authenticated" | "demo";
  role: "worker" | "customer" | null;
};

const DEMO_ACTOR = /^demo-[a-z0-9]{20}$/;

function bearerPresent(request: Request): boolean {
  return /^Bearer\s+\S+$/i.test(request.headers.get("authorization") ?? "");
}

function demoIdentity(request: Request): FeedIdentity | FeedDenial {
  const role = request.headers.get("x-weda-demo-role");
  if (role !== "worker" && role !== "customer") {
    return {
      status: 400,
      error: "Choose the demo role: worker or customer. This choice is not authentication.",
      access: "demo",
      role: null,
    };
  }
  if (role === "customer") {
    return {
      status: 403,
      error: "Suggested jobs are for workers. This demo role is Customer, so the feed stays hidden. Demo role selection is not authentication.",
      access: "demo",
      role: "customer",
    };
  }
  const actorKey = request.headers.get("x-weda-demo-actor") ?? "";
  if (!DEMO_ACTOR.test(actorKey)) {
    return {
      status: 400,
      error: "The demo identity is missing. It is a browser key, not a verified account.",
      access: "demo",
      role: "worker",
    };
  }
  const name = cleanText(request.headers.get("x-weda-demo-name"), 60);
  return {
    access: "demo",
    role: "worker",
    actorKey,
    displayName: name.length >= 2 ? name : "Demo worker",
  };
}

export function isFeedIdentity(value: FeedIdentity | FeedDenial): value is FeedIdentity {
  return "actorKey" in value;
}

export function denyFeed(access: FeedDenial) {
  return NextResponse.json(
    { error: access.error, access: access.access, role: access.role },
    { status: access.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function resolveFeedAccess(request: Request): Promise<FeedIdentity | FeedDenial> {
  if (!bearerPresent(request)) return demoIdentity(request);

  const auth = await requireUser(request);
  if (!auth.ok) {
    if (auth.error === "unavailable") {
      return {
        status: 503,
        error: "Sign-in is not configured, so this token cannot be checked. Open the feed without a sign-in token to use the labelled demo role.",
        access: "authenticated",
        role: null,
      };
    }
    return {
      status: 401,
      error: "That sign-in could not be verified.",
      access: "authenticated",
      role: null,
    };
  }

  const { data, error } = await auth.client.from("profiles").select("role, full_name").eq("id", auth.userId).maybeSingle();
  const role = data?.role === "worker" || data?.role === "customer" ? data.role : null;
  if (error || !role) {
    return {
      status: 403,
      error: "This signed-in account has no worker or customer role on file.",
      access: "authenticated",
      role: null,
    };
  }
  if (role === "customer") {
    return {
      status: 403,
      error: "This account is a customer. Suggested jobs are only available to workers.",
      access: "authenticated",
      role: "customer",
    };
  }

  const name = cleanText(data?.full_name, 80);
  return {
    access: "authenticated",
    role: "worker",
    actorKey: `user:${auth.userId}`,
    displayName: name.length >= 2 ? name : "Worker",
  };
}
