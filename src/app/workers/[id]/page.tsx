"use client";

// Public profile: summary, photos, reviews, and a request button.

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { errorMessage, readJson, type Worker } from "@/lib/types";

export default function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang } = useLang();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/workers?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => readJson<{ workers: Worker[] }>(res))
      .then((data) => {
        if (cancelled) return;
        if (!data.workers[0]) setMissing(true);
        else setWorker(data.workers[0]);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <p className="text-red-800">{error}</p>;
  if (missing) {
    return (
      <div className="space-y-3">
        <p>{t("notFound", lang)}</p>
        <Link href="/workers" className="btn-secondary">
          {t("back", lang)}
        </Link>
      </div>
    );
  }
  if (!worker) return <p>{t("loading", lang)}</p>;

  const phoneHref = `tel:${worker.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{worker.name}</h1>
      <p className="text-lg">
        {t(`trade.${worker.trade}`, lang)} · {worker.area}
        {worker.years_experience !== null ? ` · ${worker.years_experience} ${t("years", lang)}` : ""}
      </p>
      <AiDisclaimer />
      <p className="text-xl font-semibold">{worker.headline}</p>
      <section className="card space-y-2">
        <h2 className="text-lg font-bold">{t("about", lang)}</h2>
        <p>{worker.summary}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">{t("skills", lang)}</h2>
        <ul className="flex flex-wrap gap-2">
          {worker.skills.map((skill) => (
            <li key={skill} className="rounded-full bg-white px-3 py-2 text-base">
              {skill}
            </li>
          ))}
        </ul>
      </section>
      <p>
        <span className="font-semibold">{t("languagesLabel", lang)}: </span>
        {worker.languages.join(", ") || "—"}
      </p>
      <p>
        <span className="font-semibold">{t("phone", lang)}: </span>
        {worker.phone}
      </p>
      <a className="btn-secondary" href={phoneHref}>
        {t("call", lang)}
      </a>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">{t("photos", lang)}</h2>
        {worker.photos.length === 0 ? <p>{t("noPhotos", lang)}</p> : null}
        <div className="grid grid-cols-2 gap-2">
          {worker.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.path} alt="" className="h-36 w-full rounded-xl object-cover" />
          ))}
        </div>
      </section>
      {worker.raw_description ? (
        <details className="card">
          <summary className="cursor-pointer text-lg font-semibold">{t("originalWords", lang)}</summary>
          <p className="mt-2">{worker.raw_description}</p>
        </details>
      ) : null}
      <section className="space-y-2">
        <h2 className="text-lg font-bold">{t("reviews", lang)}</h2>
        {(worker.reviews ?? []).length === 0 ? <p>{t("noReviews", lang)}</p> : null}
        {(worker.reviews ?? []).map((review) => (
          <article key={review.id} className="card">
            <p className="font-semibold">
              {"★".repeat(review.rating)}
              {"☆".repeat(Math.max(0, 5 - review.rating))} {review.reviewer_name}
            </p>
            <p>{review.comment}</p>
          </article>
        ))}
      </section>
      <Link href={`/jobs/new?workerId=${worker.id}`} className="btn-primary">
        {t("requestThisWorker", lang)}
      </Link>
    </div>
  );
}
