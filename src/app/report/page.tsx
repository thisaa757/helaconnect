"use client";

// Report link from a public profile. The note stays on this page for the demo.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLang } from "@/components/LanguageToggle";
import { primaryButtonClass, secondaryButtonClass } from "@/components/profile/ui";
import { profileTranslations } from "@/lib/profile/translations";

function ReportForm() {
  const { lang } = useLang();
  const copy = profileTranslations[lang];
  const params = useSearchParams();
  const profileId = params.get("profile") ?? "";
  const [sent, setSent] = useState(false);

  if (!profileId) {
    return (
      <section className="card mx-auto max-w-lg space-y-3">
        <h1 className="text-2xl font-bold">{copy.reportTitle}</h1>
        <p>{copy.reportMissing}</p>
      </section>
    );
  }

  return (
    <section className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{copy.reportTitle}</h1>
      {sent ? (
        <p role="status">{copy.reportThanks}</p>
      ) : (
        <>
          <p className="text-stone-600">{copy.reportBody}</p>
          <button type="button" className={primaryButtonClass} onClick={() => setSent(true)}>
            {copy.reportSend}
          </button>
        </>
      )}
      <Link href={`/u/${profileId}`} className={secondaryButtonClass}>
        {copy.backToProfile}
      </Link>
    </section>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="card mx-auto h-40 max-w-lg animate-pulse bg-stone-100" aria-busy="true" />}>
      <ReportForm />
    </Suspense>
  );
}
