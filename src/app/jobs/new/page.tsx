"use client";

// Customer flow: plain words -> AI structure -> confirm -> save.
// If they came from a profile (?workerId=), saving also creates a request.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { VoiceInput } from "@/components/VoiceInput";
import { t } from "@/lib/i18n";
import { AREAS, TRADES, errorMessage, readJson, type Job, type JobDraft, type Trade } from "@/lib/types";

export default function NewJobPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [rawText, setRawText] = useState("");
  const [draft, setDraft] = useState<JobDraft | null>(null);
  const [trade, setTrade] = useState<Trade | "">("");
  const [area, setArea] = useState("");
  const [size, setSize] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [summary, setSummary] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [mock, setMock] = useState(false);
  const [busy, setBusy] = useState<"draft" | "save" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("workerId");
    setWorkerId(id);
  }, []);

  async function structure() {
    setError("");
    setBusy("draft");
    try {
      const res = await fetch("/api/jobs/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data = await readJson<{ draft: JobDraft; mock: boolean }>(res);
      setDraft(data.draft);
      setMock(data.mock);
      setTrade(data.draft.trade ?? "");
      setArea(data.draft.area ?? "");
      setSize(data.draft.size_estimate ?? "");
      setTimeframe(data.draft.timeframe ?? "");
      setSummary(data.draft.summary ?? "");
      setMissing(data.draft.missing_info);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setError("");
    if (!customerName || !trade || !area || !summary) {
      setError(t("jobRequired", lang));
      return;
    }
    setBusy("save");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          raw_text: rawText,
          trade,
          area,
          size_estimate: size || null,
          timeframe: timeframe || null,
          summary,
        }),
      });
      const data = await readJson<{ job: Job }>(res);
      if (workerId) {
        await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: data.job.id, worker_id: Number(workerId) }),
        });
      }
      router.push(`/jobs/${data.job.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">{t("newJobTitle", lang)}</h1>
      <p>{t("newJobHint", lang)}</p>
      {workerId ? <p className="font-semibold">{t("willAlsoRequest", lang)}</p> : null}
      <label className="block space-y-1 font-semibold">
        {t("customerName", lang)}
        <input className="field" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
      </label>
      <VoiceInput labelKey="describeJob" value={rawText} onChange={setRawText} placeholder={t("exampleJob", lang)} />
      <button type="button" className="btn-primary" disabled={busy !== null || rawText.trim().length < 8} onClick={structure}>
        {busy === "draft" ? t("structuring", lang) : t("structureJob", lang)}
      </button>

      {draft ? (
        <section className="card space-y-4">
          <AiDisclaimer />
          {mock ? <p className="font-semibold">{t("mockBanner", lang)}</p> : null}
          <p className="font-semibold">{t("reviewJob", lang)}</p>
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
            <input className="field" list="job-areas" value={area} onChange={(event) => setArea(event.target.value)} />
          </label>
          <datalist id="job-areas">
            {AREAS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <p className="text-base text-stone-600">{t("areaHint", lang)}</p>
          <label className="block space-y-1 font-semibold">
            {t("size", lang)}
            <input className="field" value={size} onChange={(event) => setSize(event.target.value)} />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("timeframe", lang)}
            <input className="field" value={timeframe} onChange={(event) => setTimeframe(event.target.value)} />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("summary", lang)}
            <textarea className="field" value={summary} onChange={(event) => setSummary(event.target.value)} />
          </label>
          {missing.length > 0 ? (
            <div>
              <p className="font-semibold">{t("missingInfo", lang)}</p>
              <ul className="list-disc pl-5">
                {missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <button type="button" className="btn-primary" disabled={busy !== null} onClick={save}>
            {busy === "save" ? t("saving", lang) : t("saveJob", lang)}
          </button>
        </section>
      ) : null}
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-red-800">{error}</p> : null}
    </div>
  );
}
