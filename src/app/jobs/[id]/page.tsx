"use client";

// Shows the saved job, a rough price guide, and AI-ranked workers.

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { errorMessage, readJson, type Job, type PriceGuide, type RankedMatch } from "@/lib/types";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang } = useLang();
  const [job, setJob] = useState<Job | null>(null);
  const [missing, setMissing] = useState(false);
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [price, setPrice] = useState<PriceGuide | null>(null);
  const [sent, setSent] = useState<number[]>([]);
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/jobs?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => readJson<{ jobs: Job[] }>(res))
      .then((data) => {
        if (cancelled) return;
        if (!data.jobs[0]) setMissing(true);
        else setJob(data.jobs[0]);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    setFinding(true);
    fetch(`/api/jobs/${job.id}/match`, { method: "POST" })
      .then((res) => readJson<{ matches: RankedMatch[]; price_guide: PriceGuide | null }>(res))
      .then((data) => {
        if (cancelled) return;
        setMatches(data.matches);
        setPrice(data.price_guide);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setFinding(false);
      });
    return () => {
      cancelled = true;
    };
  }, [job]);

  async function requestWorker(workerId: number) {
    if (!job) return;
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id, worker_id: workerId }),
      });
      await readJson(res);
      setSent((current) => [...current, workerId]);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (error && !job) return <p className="text-red-800">{error}</p>;
  if (missing) {
    return (
      <div className="space-y-3">
        <p>{t("notFound", lang)}</p>
        <Link href="/" className="btn-secondary">
          {t("home", lang)}
        </Link>
      </div>
    );
  }
  if (!job) return <p>{t("loading", lang)}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t("jobTitle", lang)}</h1>
      <AiDisclaimer />
      <section className="card space-y-2">
        <p>
          <span className="font-semibold">{t("customer", lang)}: </span>
          {job.customer_name}
        </p>
        <p>
          <span className="font-semibold">{t("trade", lang)}: </span>
          {t(`trade.${job.trade}`, lang)}
        </p>
        <p>
          <span className="font-semibold">{t("area", lang)}: </span>
          {job.area}
        </p>
        <p>
          <span className="font-semibold">{t("size", lang)}: </span>
          {job.size_estimate || "—"}
        </p>
        <p>
          <span className="font-semibold">{t("timeframe", lang)}: </span>
          {job.timeframe || "—"}
        </p>
        <p>{job.summary}</p>
        <details>
          <summary className="cursor-pointer font-semibold">{t("rawText", lang)}</summary>
          <p className="mt-2">{job.raw_text}</p>
        </details>
      </section>

      {price ? (
        <section className="card space-y-1">
          <h2 className="text-lg font-bold">{t("priceGuide", lang)}</h2>
          <p className="text-xl font-semibold">
            {price.currency} {price.low.toLocaleString()} – {price.high.toLocaleString()}
          </p>
          <p>{price.note}</p>
        </section>
      ) : null}

      <h2 className="text-2xl font-bold">{t("matchesTitle", lang)}</h2>
      {finding ? <p>{t("finding", lang)}</p> : null}
      {!finding && matches.length === 0 ? <p>{t("noMatches", lang)}</p> : null}
      <div className="space-y-3">
        {matches.map((match) => (
          <article key={match.worker_id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">{match.worker.name}</h3>
                <p>
                  {t(`trade.${match.worker.trade}`, lang)} · {match.worker.area}
                </p>
              </div>
              <p className="rounded-full bg-emerald-100 px-3 py-2 text-lg font-bold text-brand">
                {t("score", lang)} {match.score}
              </p>
            </div>
            <p>{match.reason}</p>
            <Link href={`/workers/${match.worker.id}`} className="btn-secondary">
              {t("viewProfile", lang)}
            </Link>
            <button
              type="button"
              className="btn-primary"
              disabled={sent.includes(match.worker_id)}
              onClick={() => requestWorker(match.worker_id)}
            >
              {sent.includes(match.worker_id) ? t("requestSent", lang) : t("request", lang)}
            </button>
          </article>
        ))}
      </div>
      {error ? <p className="text-red-800">{error}</p> : null}
    </div>
  );
}
