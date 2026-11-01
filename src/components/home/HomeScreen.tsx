"use client";

// Home always stays on this page. Workers see jobs. Everyone else sees people nearby.

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { CustomerHome } from "@/components/home/CustomerHome";
import { SuggestedFeed } from "@/components/suggested/SuggestedFeed";
import { getProfileDraft, getServerProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";

export function HomeScreen() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const worker = draft.signedUp && draft.role === "worker";

  if (worker) return <SuggestedFeed page="home" initialQuery={query} />;
  return <CustomerHome query={query} />;
}
