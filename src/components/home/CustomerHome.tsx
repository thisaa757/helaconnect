"use client";

// Customer home: a post prompt and sample people nearby.

import { useSyncExternalStore } from "react";
import { Composer } from "@/components/home/Composer";
import { useLang } from "@/components/LanguageToggle";
import { SAMPLE_WORKERS } from "@/lib/home/samples";
import { t } from "@/lib/i18n";
import { getProfileDraft, getServerProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { initials } from "@/lib/profile/validate";

export function CustomerHome({ query }: { query: string }) {
  const { lang } = useLang();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const name = draft.values.fullName.trim() || t("customer", lang);
  const needle = query.trim().toLowerCase();
  const people = SAMPLE_WORKERS.filter((person) => {
    if (!needle) return true;
    return `${person.name} ${person.trade} ${person.area} ${person.about}`.toLowerCase().includes(needle);
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <h1 className="sr-only">{t("home", lang)}</h1>
      <Composer name={name} prompt={t("composerCustomer", lang)} />
      <p className="px-1 text-sm text-stone-600">{t("customerHomeBody", lang)}</p>
      {people.length === 0 ? <p className="card text-stone-700">{t("noFilterResults", lang)}</p> : null}
      <ul className="space-y-3">
        {people.map((person) => (
          <li key={person.id}>
            <article className="card space-y-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F5EDE3] text-sm font-bold text-[#2F3A7A]"
                >
                  {initials(person.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold leading-tight">{person.name}</h2>
                    <span className="rounded-full bg-[#F5EDE3] px-2 py-0.5 text-xs font-bold text-[#2F3A7A]">{t("sampleLabel", lang)}</span>
                  </div>
                  <p className="text-sm text-stone-600">
                    {person.trade} · {person.area} · {person.years} {t("yearsShort", lang)}
                  </p>
                  <p className="text-sm font-semibold text-amber-700">★ {person.rating.toFixed(1)}</p>
                </div>
              </div>
              <p className="text-stone-800">{person.about}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
