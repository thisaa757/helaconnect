"use client";

// Shown on every page that displays AI text.

import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";

export function AiDisclaimer() {
  const { lang } = useLang();
  return (
    <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-base text-amber-950">{t("disclaimer", lang)}</p>
  );
}
