"use client";

// Desktop identity card and a short list of nearby jobs or workers.

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLang } from "@/components/LanguageToggle";
import { categoryLabel } from "@/lib/categories";
import { SAMPLE_WORKERS } from "@/lib/home/samples";
import { t } from "@/lib/i18n";
import { getProfileDraft, getServerProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { initials } from "@/lib/profile/validate";
import { INTEREST_SAMPLE_JOBS } from "@/lib/suggested/samples";

export function IdentityRail() {
  const { lang } = useLang();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const name = draft.values.fullName.trim();
  const trade = draft.values.businessType ? categoryLabel(draft.values.businessType, lang) : "";
  const district = draft.values.district.trim();
  const headline = [trade || (draft.signedUp ? t(draft.role === "worker" ? "workerRole" : "customerRole", lang) : ""), district]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside className="hidden lg:block">
      <div className="card sticky top-20 overflow-hidden" style={{ padding: 0 }}>
        <div className="h-14 bg-[#2F3A7A]" />
        <div className="px-4 pb-4">
          <div className="-mt-7 mb-3 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-[#2F3A7A] text-sm font-bold text-white">
            {initials(name || "Hela")}
          </div>
          <p className="text-lg font-bold leading-tight">{name || t("yourProfile", lang)}</p>
          <p className="mt-1 text-sm text-stone-600">{headline || t("completeProfile", lang)}</p>
          <Link href={draft.signedUp ? "/profile" : "/signup"} className="mt-3 inline-flex text-sm font-bold text-[#2F3A7A] no-underline hover:underline">
            {draft.signedUp ? t("viewProfile", lang) : t("createAccount", lang)}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function NearbyRail() {
  const { lang } = useLang();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const worker = draft.signedUp && draft.role === "worker";

  return (
    <aside className="hidden lg:block">
      <div className="card sticky top-20 space-y-3">
        <h2 className="text-base font-bold">{worker ? t("nearbyJobs", lang) : t("nearbyWorkers", lang)}</h2>
        {worker ? (
          <ul className="space-y-3">
            {INTEREST_SAMPLE_JOBS.slice(0, 3).map((job) => (
              <li key={job.summary} className="border-t border-stone-200 pt-3 first:border-t-0 first:pt-0">
                <p className="font-semibold leading-snug">{job.summary}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {job.area} · {job.timeframe}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {SAMPLE_WORKERS.slice(0, 3).map((person) => (
              <li key={person.id} className="flex items-start gap-3 border-t border-stone-200 pt-3 first:border-t-0 first:pt-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F5EDE3] text-xs font-bold text-[#2F3A7A]">
                  {initials(person.name)}
                </span>
                <span>
                  <span className="block font-semibold leading-tight">{person.name}</span>
                  <span className="mt-0.5 block text-sm text-stone-600">
                    {person.trade} · {person.area}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href={worker ? "/home" : "/work"} className="inline-flex text-sm font-bold text-[#2F3A7A] no-underline hover:underline">
          {worker ? t("home", lang) : t("composerCustomer", lang)}
        </Link>
      </div>
    </aside>
  );
}
