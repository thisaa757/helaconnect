// One posted ad: picture, work description, district, and job role.

import { categoryLabel } from "@/lib/categories";
import type { ProfileAd } from "@/lib/profile/ads";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function AdCard({ ad, lang }: { ad: ProfileAd; lang: Lang }) {
  return (
    <article className="card space-y-3">
      <img src={ad.image} alt={categoryLabel(ad.jobRole, lang)} className="h-48 w-full rounded-2xl bg-[#F5EDE3] object-cover" />
      {ad.sample ? (
        <p className="text-sm font-bold uppercase tracking-wide text-[#2F3A7A]">{t("postSample", lang)}</p>
      ) : null}
      <p className="whitespace-pre-wrap text-stone-900">{ad.description}</p>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="font-bold text-stone-600">{t("postDistrict", lang)}</dt>
          <dd>{ad.district}</dd>
        </div>
        <div>
          <dt className="font-bold text-stone-600">{t("postJobRole", lang)}</dt>
          <dd>{categoryLabel(ad.jobRole, lang)}</dd>
        </div>
      </dl>
    </article>
  );
}
