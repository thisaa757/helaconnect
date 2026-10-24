"use client";

// Demo inbox. The worker picks their own name. There is no real login.

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { errorMessage, readJson, type WorkRequest, type Worker } from "@/lib/types";

const STORAGE_KEY = "tradelink-inbox-worker";

export default function InboxPage() {
  const { lang } = useLang();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/workers", { cache: "no-store" })
      .then((res) => readJson<{ workers: Worker[] }>(res))
      .then((data) => setWorkers(data.workers))
      .catch((err) => setError(errorMessage(err)));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWorkerId(saved);
    } catch {
      // Storage blocked. The dropdown still works for this visit.
    }
  }, []);

  useEffect(() => {
    if (!workerId) {
      setRequests([]);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, workerId);
    } catch {
      // Ignore.
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/requests?workerId=${encodeURIComponent(workerId)}`, { cache: "no-store" })
      .then((res) => readJson<{ requests: WorkRequest[] }>(res))
      .then((data) => {
        if (!cancelled) setRequests(data.requests);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t("inboxTitle", lang)}</h1>
      <p>{t("inboxHint", lang)}</p>
      <AiDisclaimer />
      <label className="block space-y-1 font-semibold">
        {t("pickYourself", lang)}
        <select
          className="field"
          value={workerId}
          onChange={(event) => {
            setError("");
            setWorkerId(event.target.value);
          }}
        >
          <option value="">{t("chooseWorker", lang)}</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name} · {t(`trade.${worker.trade}`, lang)} · {worker.area}
            </option>
          ))}
        </select>
      </label>
      {loading ? <p>{t("loading", lang)}</p> : null}
      {workerId && !loading && requests.length === 0 ? <p>{t("noRequests", lang)}</p> : null}
      <div className="space-y-3">
        {requests.map((item) => (
          <article key={item.id} className="card space-y-2">
            <p className="text-lg font-bold">{item.customer_name}</p>
            <p>
              {t(`trade.${item.trade}`, lang)} · {item.area}
            </p>
            <p>{item.summary}</p>
            <p>
              <span className="font-semibold">{t("status", lang)}: </span>
              {item.status === "pending" ? t("pending", lang) : item.status}
            </p>
            <p className="text-base text-stone-600">
              {t("received", lang)}: {item.created_at}
            </p>
            <Link href={`/jobs/${item.job_id}`} className="btn-secondary">
              {t("jobTitle", lang)}
            </Link>
          </article>
        ))}
      </div>
      {error ? <p className="text-red-800">{error}</p> : null}
    </div>
  );
}
