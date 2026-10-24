"use client";

// Browser speech-to-text. If the browser has no Web Speech API, only the textarea shows.

import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

type SpeechResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechCtor = new () => SpeechRec;

const SPEECH_LANG: Record<Lang, string> = {
  en: "en-US",
  si: "si-LK",
  ta: "ta-LK",
};

function recognitionCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelKey?: string;
};

export function VoiceInput({ value, onChange, placeholder, labelKey = "describeSkills" }: Props) {
  const { lang } = useLang();
  const [speechLang, setSpeechLang] = useState<Lang>(lang);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [rec, setRec] = useState<SpeechRec | null>(null);

  useEffect(() => {
    setSupported(Boolean(recognitionCtor()));
  }, []);

  useEffect(() => {
    setSpeechLang(lang);
  }, [lang]);

  useEffect(() => {
    return () => {
      try {
        rec?.stop();
      } catch {
        // Already stopped.
      }
    };
  }, [rec]);

  function toggle() {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    if (listening && rec) {
      rec.stop();
      setListening(false);
      return;
    }
    const next = new Ctor();
    next.lang = SPEECH_LANG[speechLang];
    next.continuous = false;
    next.interimResults = false;
    next.onresult = (event) => {
      const said = event.results[event.results.length - 1]?.[0]?.transcript?.trim();
      if (!said) return;
      onChange(value.trim() ? `${value.trim()} ${said}` : said);
    };
    next.onerror = () => setListening(false);
    next.onend = () => setListening(false);
    setRec(next);
    try {
      next.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold" htmlFor="voice-text">
        {t(labelKey, lang)}
      </label>
      <textarea
        id="voice-text"
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {supported ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-base font-semibold">
            {t("speechLang", lang)}
            <select className="field" value={speechLang} onChange={(event) => setSpeechLang(event.target.value as Lang)}>
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>
          <button type="button" className="btn-secondary sm:self-end" onClick={toggle}>
            {listening ? t("voiceStop", lang) : t("voiceStart", lang)}
          </button>
        </div>
      ) : (
        <p className="text-base text-stone-600">{t("voiceUnsupported", lang)}</p>
      )}
      {listening ? <p className="text-base font-semibold text-brand">{t("voiceListening", lang)}</p> : null}
    </div>
  );
}
