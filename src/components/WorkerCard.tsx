"use client";

// One worker in the directory or a match list.

import Link from "next/link";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import type { Worker } from "@/lib/types";

export function WorkerCard({ worker }: { worker: Worker }) {
  const { lang } = useLang();
  const photo = worker.photos[0];
  return (
    <article className="card space-y-3">
      <div className="flex gap-3">
        {photo ? (
          // User uploads are local files. A plain img keeps the path simple.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.path} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-emerald-100 text-2xl font-bold text-brand">
            {worker.name.slice(0, 1)}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">{worker.name}</h2>
          <p className="text-base text-stone-700">
            {t(`trade.${worker.trade}`, lang)} · {worker.area}
            {worker.years_experience !== null ? ` · ${worker.years_experience} ${t("years", lang)}` : ""}
          </p>
        </div>
      </div>
      <p className="text-lg">{worker.headline}</p>
      <Link href={`/workers/${worker.id}`} className="btn-secondary">
        {t("viewProfile", lang)}
      </Link>
    </article>
  );
}
