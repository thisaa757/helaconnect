// GET /api/suggested. Jobs come from the local SQLite database.
// A verified worker session is checked when a bearer token is sent.
// Otherwise the demo role header is only a labelled preview.

import type { NextRequest } from "next/server";
import { denyFeed, isFeedIdentity, resolveFeedAccess } from "@/lib/suggested/access";
import { presentFeed } from "@/lib/suggested/present";
import { isSuggestedInterest } from "@/lib/suggested/samples";
import { fail, ok } from "@/lib/http";
import { cleanText, cleanTrade } from "@/lib/types";

export async function GET(request: NextRequest) {
  const access = await resolveFeedAccess(request);
  if (!isFeedIdentity(access)) return denyFeed(access);

  const area = cleanText(request.nextUrl.searchParams.get("area"), 80);
  const tradeText = cleanText(request.nextUrl.searchParams.get("trade"), 40);
  const search = cleanText(request.nextUrl.searchParams.get("q"), 80);
  const interestParam = request.nextUrl.searchParams.get("interests");
  const interests = interestParam === null ? undefined : interestParam.split(",").map((item) => item.trim()).filter(isSuggestedInterest);
  const trade = tradeText ? (interests ? (isSuggestedInterest(tradeText.toLowerCase()) ? tradeText.toLowerCase() : null) : cleanTrade(tradeText)) : null;
  if (tradeText && !trade) return fail("Choose a supported trade.");

  try {
    const feed = presentFeed(
      { area: area || undefined, trade: trade ?? undefined, search: search || undefined, interests },
      access.actorKey,
    );
    return ok({
      access: access.access,
      role: access.role,
      jobs: feed.posts,
      areas: feed.areas,
      trades: feed.trades,
      demo: access.access === "demo",
    });
  } catch {
    return fail("The job feed could not be loaded.", 500);
  }
}
