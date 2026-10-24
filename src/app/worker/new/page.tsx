"use client";

// Worker flow: voice or text -> AI draft -> edit -> save -> optional photo.

import Link from "next/link";
import { useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { VoiceInput } from "@/components/VoiceInput";
import { t } from "@/lib/i18n";
import { AREAS, SPOKEN, TRADES, errorMessage, readJson, type Trade, type Worker, type WorkerDraft } from "@/lib/types";

export default function NewWorkerPage() {
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [trade, setTrade] = useState<Trade | "">("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [years, setYears] = useState("");
  const [area, setArea] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [mock, setMock] = useState(false);
  const [busy, setBusy] = useState<"draft" | "save" | "photo" | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Worker | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  async function generate() {
    setError("");
    setBusy("draft");
    try {
      const res = await fetch("/api/workers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: description }),
      });
      const data = await readJson<{ draft: WorkerDraft; mock: boolean }>(res);
      const draft = data.draft;
      setDraftReady(true);
      setMock(data.mock);
      if (!name && draft.name) setName(draft.name);
      setTrade(draft.trade ?? "");
      setHeadline(draft.headline ?? "");
      setSummary(draft.summary ?? "");
      setSkills(draft.skills.join(", "));
      setYears(draft.years_experience === null ? "" : String(draft.years_experience));
      setArea(draft.area ?? "");
      setLanguages(draft.languages);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function toggleLanguage(language: string) {
    setLanguages((current) => (current.includes(language) ? current.filter((item) => item !== language) : [...current, language]));
  }

  async function save() {
    setError("");
    if (!name || !phone || !trade || !area || !headline || !summary) {
      setError(t("fillRequired", lang));
      return;
    }
    setBusy("save");
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          trade,
          headline,
          summary,
          skills: skills.split(",").map((item) => item.trim()).filter(Boolean),
          years_experience: years === "" ? null : Number(years),
          area,
          languages,
          raw_description: description,
        }),
      });
      const data = await readJson<{ worker: Worker }>(res);
      setSaved(data.worker);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!saved) return;
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("photo");
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.[0]) {
      setError("Choose an image first.");
      return;
    }
    setError("");
    setBusy("photo");
    try {
      const body = new FormData();
      body.set("photo", fileInput.files[0]);
      const res = await fetch(`/api/workers/${saved.id}/photos`, { method: "POST", body });
      const data = await readJson<{ photo: { path: string } }>(res);
      setPhotos((current) => [...current, data.photo.path]);
      form.reset();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">{t("newWorkerTitle", lang)}</h1>
      <p>{t("newWorkerHint", lang)}</p>

      <label className="block space-y-1 font-semibold">
        {t("name", lang)}
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="block space-y-1 font-semibold">
        {t("phoneLabel", lang)}
        <input className="field" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>

      <VoiceInput value={description} onChange={setDescription} placeholder={t("exampleWorker", lang)} />
      <button type="button" className="btn-primary" disabled={busy !== null || description.trim().length < 8} onClick={generate}>
        {busy === "draft" ? t("generating", lang) : t("generateProfile", lang)}
      </button>

      {draftReady ? (
        <section className="card space-y-4">
          <AiDisclaimer />
          {mock ? <p className="text-base font-semibold">{t("mockBanner", lang)}</p> : null}
          <p className="font-semibold">{t("reviewDraft", lang)}</p>
          <label className="block space-y-1 font-semibold">
            {t("trade", lang)}
            <select className="field" value={trade} onChange={(event) => setTrade(event.target.value as Trade | "")}>
              <option value="">{t("choose", lang)}</option>
              {TRADES.map((item) => (
                <option key={item} value={item}>
                  {t(`trade.${item}`, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 font-semibold">
            {t("area", lang)}
            <input className="field" list="areas" value={area} onChange={(event) => setArea(event.target.value)} />
          </label>
          <datalist id="areas">
            {AREAS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <p className="text-base text-stone-600">{t("areaHint", lang)}</p>
          <label className="block space-y-1 font-semibold">
            {t("headline", lang)}
            <input className="field" value={headline} onChange={(event) => setHeadline(event.target.value)} />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("summary", lang)}
            <textarea className="field" value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("skillsHint", lang)}
            <input className="field" value={skills} onChange={(event) => setSkills(event.target.value)} />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("yearsLabel", lang)}
            <input className="field" inputMode="numeric" value={years} onChange={(event) => setYears(event.target.value)} />
          </label>
          <fieldset className="space-y-2">
            <legend className="font-semibold">{t("spokenLanguages", lang)}</legend>
            {SPOKEN.map((language) => (
              <label key={language} className="flex min-h-11 items-center gap-3 text-lg">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                />
                {language}
              </label>
            ))}
          </fieldset>
          <button type="button" className="btn-primary" disabled={busy !== null || Boolean(saved)} onClick={save}>
            {busy === "save" ? t("saving", lang) : t("saveProfile", lang)}
          </button>
        </section>
      ) : null}

      {saved ? (
        <section className="card space-y-3">
          <p className="text-lg font-semibold">{t("saved", lang)}</p>
          <Link href={`/workers/${saved.id}`} className="btn-secondary">
            {t("viewSaved", lang)}
          </Link>
          <form className="space-y-3" onSubmit={upload}>
            <p className="font-semibold">{t("uploadPhoto", lang)}</p>
            <p className="text-base text-stone-600">{t("photoHint", lang)}</p>
            <input className="field" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
            <button className="btn-primary" type="submit" disabled={busy !== null}>
              {busy === "photo" ? t("saving", lang) : t("uploadPhoto", lang)}
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((path) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={path} src={path} alt="" className="h-32 w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-red-800">{error}</p> : null}
    </div>
  );
}
