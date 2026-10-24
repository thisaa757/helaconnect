"use client";

// Home always stays on this page. The job feed is shown for a worker signup.

import { useSyncExternalStore } from "react";
import { useLang } from "@/components/LanguageToggle";
import { SuggestedFeed } from "@/components/suggested/SuggestedFeed";
import { t } from "@/lib/i18n";
import { getProfileDraft, getServerProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";

export default function HomePage() {
  const { lang } = useLang();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const worker = draft.signedUp && draft.role === "worker";

  if (worker) return <SuggestedFeed page="home" />;

  return (
    <section className="card mx-auto max-w-2xl space-y-2">
      <h1 className="text-3xl font-bold">{t("home", lang)}</h1>
      <p className="text-stone-700">{t("homeWorkerOnly", lang)}</p>
    </section>
  );
}
