"use client";

// Directory. Filters call the API with ?trade= and ?area=.

import { useEffect, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { WorkerCard } from "@/components/WorkerCard";
import { t } from "@/lib/i18n";
import { AREAS, TRADES, errorMessage, readJson, type Worker } from "@/lib/types";

export default function WorkersPage() {
  const { lang } = useLang();
  const [trade, setTrade] = useState("");
  const [area, setArea] = useState("");
  const [areas, setAreas] = useState<string[]>([...AREAS]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (trade) params.set("trade", trade);
    if (area) params.set("area", area);
    const query = params.toString();
    let cancelled = false;
    setLoading(true);
    fetch(`/api/workers${query ? `?${query}` : ""}`, { cache: "no-store" })
      .then((res) => readJson<{ workers: Worker[] }>(res))
      .then((data) => {
        if (cancelled) return;
        setWorkers(data.workers);
        if (!trade && !area) {
          const extra = data.workers.map((worker) => worker.area).filter(Boolean);
          setAreas(Array.from(new Set([...AREAS, ...extra])));
        }
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
  }, [trade, area]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{t("directoryTitle", lang)}</h1>
      <p>{t("directoryHint", lang)}</p>
      <AiDisclaimer />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 font-semibold">
          {t("trade", lang)}
          <select className="field" value={trade} onChange={(event) => setTrade(event.target.value)}>
            <option value="">{t("all", lang)}</option>
            {TRADES.map((item) => (
              <option key={item} value={item}>
                {t(`trade.${item}`, lang)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 font-semibold">
          {t("area", lang)}
          <select className="field" value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="">{t("all", lang)}</option>
            {areas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? <p>{t("loading", lang)}</p> : null}
      {error ? <p className="text-red-800">{error}</p> : null}
      {!loading && workers.length === 0 ? <p>{t("noWorkers", lang)}</p> : null}
      <div className="space-y-3">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}
