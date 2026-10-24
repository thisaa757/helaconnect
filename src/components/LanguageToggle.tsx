"use client";

// UI language: English / Sinhala / Tamil. Saved in localStorage.
// The try/catch matters when storage is blocked (private mode).

import { createContext, useContext, useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const STORAGE_KEY = "tradelink-lang";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "si" || saved === "ta") setLangState(saved);
    } catch {
      // Storage can throw. English stays selected.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "si" ? "si" : lang === "ta" ? "ta" : "en";
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore blocked storage. The choice still applies to this visit.
    }
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

const OPTIONS: { id: Lang; label: string; full: string }[] = [
  { id: "en", label: "en", full: "English" },
  { id: "si", label: "සිංහල", full: "සිංහල" },
  { id: "ta", label: "தமிழ்", full: "தமிழ்" },
];

export function LanguageToggle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-1" role="group" aria-label="Language">
      {OPTIONS.map((option) => {
        const selected = lang === option.id;
        const dark = selected ? "bg-primary text-secondary" : "bg-white/15 text-primary";
        const light = selected
          ? "bg-[#0F766E] text-white"
          : "border border-[#E2E8F0] bg-white text-[#0F172A]";
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setLang(option.id)}
            className={`min-h-11 rounded-full px-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] ${
              tone === "light" ? light : dark
            }`}
          >
            {tone === "light" ? option.full : option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Tr({ k }: { k: string }) {
  const { lang } = useLang();
  return <>{t(k, lang)}</>;
}
