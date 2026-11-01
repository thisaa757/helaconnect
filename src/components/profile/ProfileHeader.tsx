// Header card: cover, initials, name, headline, stars, and one contact action.

import { RatingStars } from "@/components/profile/RatingStars";
import { fill, type ProfileCopy } from "@/lib/profile/translations";
import { initials } from "@/lib/profile/validate";
import type { ProfileStats } from "@/lib/profile/types";
import type { Role } from "@/lib/signup/validate";

export function ProfileHeader({
  name,
  role,
  headline,
  stats,
  ratingsError,
  email,
  phone,
  phoneLabel,
  copy,
  action,
}: {
  name: string;
  role: Role;
  headline: string;
  stats: ProfileStats;
  ratingsError: boolean;
  email: string | null;
  phone?: string | null;
  phoneLabel?: string;
  copy: ProfileCopy;
  action?: React.ReactNode;
}) {
  const countLabel = stats.count === 1 ? copy.oneRating : fill(copy.manyRatings, { count: stats.count });
  const starsLabel = stats.avg === null ? copy.noRatings : fill(copy.starsLabel, { value: stats.avg.toFixed(1) });

  return (
    <section className="card overflow-hidden" style={{ padding: 0 }}>
      <div className="h-28 bg-[#2F3A7A]" />
      <div className="px-4 pb-4">
        <div
          aria-hidden="true"
          className="-mt-10 mb-3 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[#2F3A7A] text-2xl font-bold text-white"
        >
          {initials(name)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold leading-tight">{name}</h1>
          <span className="rounded-full bg-[#F5EDE3] px-3 py-1 text-sm font-bold text-[#2F3A7A]">
            {role === "worker" ? copy.worker : copy.customer}
          </span>
        </div>
        <p className="mt-1 text-stone-700">{headline}</p>
        <div className="mt-2">
          {ratingsError ? (
            <p className="text-sm text-stone-600">{copy.ratingsError}</p>
          ) : stats.count === 0 || stats.avg === null ? (
            <p className="text-sm text-stone-600">{copy.noRatings}</p>
          ) : (
            <p className="flex flex-wrap items-center gap-2">
              <RatingStars value={stats.avg} label={starsLabel} />
              <span className="text-stone-600">{countLabel}</span>
            </p>
          )}
        </div>
        {email ? (
          <p className="mt-3 break-all text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{copy.email}: </span>
            {email}
          </p>
        ) : null}
        {phone ? (
          <p className="mt-1 text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{phoneLabel}: </span>
            {phone}
          </p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </section>
  );
}
