"use client";

// Interest chips for this visit. The choice is checked here and is not sent to a server.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageToggle";
import { primaryButtonClass, secondaryButtonClass } from "@/components/profile/ui";
import { useUnsavedWarning } from "@/components/profile/useUnsavedWarning";
import { groupedCategories, isCategoryId } from "@/lib/categories";
import { getProfileDraft, getServerProfileDraft, setProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { profileTranslations } from "@/lib/profile/translations";

export default function InterestsPage() {
  const { lang } = useLang();
  const copy = profileTranslations[lang];
  const router = useRouter();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const [override, setOverride] = useState<string[] | null>(null);
  const [toast, setToast] = useState("");
  const selected = override ?? draft.interests;

  const dirty =
    override !== null &&
    (override.length !== draft.interests.length || override.some((id) => !draft.interests.includes(id)) || draft.interests.some((id) => !override.includes(id)));
  useUnsavedWarning(dirty, copy.unsaved);

  function toggle(id: string) {
    setOverride((current) => {
      const base = current ?? getProfileDraft().interests;
      return base.includes(id) ? base.filter((item) => item !== id) : [...base, id];
    });
  }

  function save() {
    const next = selected.filter((id) => isCategoryId(id));
    if (next.length !== selected.length) {
      setToast(copy.interestsError);
      return;
    }
    setProfileDraft({ ...getProfileDraft(), interests: next });
    router.push("/profile");
  }

  return (
    <section className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{copy.interestsTitle}</h1>
      <p className="text-stone-600">{copy.interestsHint}</p>
      <p className="text-stone-700">{copy.interestsSuggested}</p>
      {groupedCategories().map((group) => (
        <fieldset key={group.id} className="space-y-2">
          <legend className="text-base font-bold">{group.labels[lang]}</legend>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((category) => {
              const on = selected.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(category.id)}
                  className={`min-h-12 rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] ${
                    on ? "bg-[#2F3A7A] text-white" : "border border-stone-300 bg-white text-stone-800"
                  }`}
                >
                  {category.labels[lang]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {toast ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {toast}
        </p>
      ) : null}
      <button type="button" className={primaryButtonClass} onClick={save}>
        {copy.interestsSave}
      </button>
      <Link href="/profile" className={secondaryButtonClass}>
        {copy.backToProfile}
      </Link>
    </section>
  );
}
