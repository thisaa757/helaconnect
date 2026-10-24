"use client";

// The app is English only. A saved Sinhala or Tamil choice is ignored.

import { createContext, useContext, useEffect } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const english: LangContextValue = {
  lang: "en",
  setLang: () => {},
};

const LangContext = createContext<LangContextValue>(english);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  return <LangContext.Provider value={english}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function Tr({ k }: { k: string }) {
  const { lang } = useLang();
  return <>{t(k, lang)}</>;
}
