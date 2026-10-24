// Selected interests. The edit link is only on the owner's profile.

import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { textButtonClass } from "@/components/profile/ui";
import type { ProfileCopy } from "@/lib/profile/translations";
import type { Lang } from "@/lib/types";

export function InterestChips({
  ids,
  error,
  canEdit,
  copy,
  lang,
}: {
  ids: string[];
  error: boolean;
  canEdit: boolean;
  copy: ProfileCopy;
  lang: Lang;
}) {
  if (!canEdit && ids.length === 0 && !error) return null;

  return (
    <section className="card space-y-3" aria-labelledby="interests-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="interests-heading" className="text-xl font-bold">
          {copy.interests}
        </h2>
        {canEdit ? (
          <Link href="/interests" className={textButtonClass}>
            {copy.editInterests}
          </Link>
        ) : null}
      </div>
      {canEdit ? <p className="text-stone-600">{copy.interestsSuggested}</p> : null}
      {error ? <p className="text-red-800">{copy.interestsError}</p> : null}
      {!error && ids.length === 0 ? <p className="text-stone-600">{copy.noInterests}</p> : null}
      {ids.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <li key={id} className="rounded-full bg-[#F5EDE3] px-3 py-2 text-sm font-semibold text-[#2F3A7A]">
              {categoryLabel(id, lang)}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
