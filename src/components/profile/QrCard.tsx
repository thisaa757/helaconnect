"use client";

// QR code of the public profile URL. Shown on a worker's public page only.

import { useEffect, useState } from "react";
import { secondaryButtonClass } from "@/components/profile/ui";
import type { ProfileCopy } from "@/lib/profile/translations";

export function QrCard({ profileId, copy }: { profileId: string; copy: ProfileCopy }) {
  const [dataUrl, setDataUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const pageUrl = typeof window === "undefined" ? "" : `${window.location.origin}/u/${profileId}`;

  useEffect(() => {
    const url = `${window.location.origin}/u/${profileId}`;
    let cancelled = false;
    // Loaded in the browser so the Node build of qrcode is not pulled into the page render.
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(url, { width: 280, margin: 1, errorCorrectionLevel: "M" }))
      .then((next) => {
        if (!cancelled) setDataUrl(next);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  function download() {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `hela-connect-${profileId}.png`;
    link.click();
  }

  return (
    <section className="card space-y-3" aria-labelledby="qr-heading">
      <h2 id="qr-heading" className="text-xl font-bold">
        {copy.qrLabel}
      </h2>
      {failed ? <p className="text-red-800">{copy.qrError}</p> : null}
      {dataUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt={copy.qrLabel} width={280} height={280} className="mx-auto h-auto w-full max-w-[280px] rounded-xl bg-white" />
          <p className="break-all text-sm text-stone-600">{pageUrl}</p>
          <button type="button" onClick={download} className={secondaryButtonClass}>
            {copy.downloadQr}
          </button>
        </>
      ) : failed ? null : (
        <div className="mx-auto h-[280px] w-full max-w-[280px] animate-pulse rounded-xl bg-stone-200" />
      )}
    </section>
  );
}
