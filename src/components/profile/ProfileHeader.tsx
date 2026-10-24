// Header card: initials, name, role badge, stars, district, and email on the owner's page.

import { RatingStars } from "@/components/profile/RatingStars";
import { fill, type ProfileCopy } from "@/lib/profile/translations";
import { initials } from "@/lib/profile/validate";
import type { ProfileStats } from "@/lib/profile/types";
import type { Role } from "@/lib/signup/validate";

export function ProfileHeader({
  name,
  role,
  districtLabel,
  stats,
  ratingsError,
  email,
  phone,
  phoneLabel,
  copy,
}: {
  name: string;
  role: Role;
  districtLabel: string;
  stats: ProfileStats;
  ratingsError: boolean;
  email: string | null;
  phone?: string | null;
  phoneLabel?: string;
  copy: ProfileCopy;
}) {
  const countLabel = stats.count === 1 ? copy.oneRating : fill(copy.manyRatings, { count: stats.count });
  const starsLabel = stats.avg === null ? copy.noRatings : fill(copy.starsLabel, { value: stats.avg.toFixed(1) });

  return (
    <section className="card">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#2F3A7A] text-xl font-bold text-white"
        >
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold leading-tight">{name}</h1>
            <span className="rounded-full bg-[#F5EDE3] px-3 py-1 text-sm font-bold text-[#2F3A7A]">
              {role === "worker" ? copy.worker : copy.customer}
            </span>
          </div>
          <p className="mt-2 text-stone-700">{districtLabel}</p>
          <div className="mt-2">
            {ratingsError ? (
              <p className="text-sm text-stone-600">{copy.ratingsError}</p>
            ) : stats.count === 0 || stats.avg === null ? (
              <p className="text-stone-600">{copy.noRatings}</p>
            ) : (
              <p className="flex flex-wrap items-center gap-2">
                <RatingStars value={stats.avg} label={starsLabel} />
                <span className="text-stone-600">{countLabel}</span>
              </p>
            )}
          </div>
          {email ? (
            <p className="mt-3 break-all text-stone-700">
              <span className="font-semibold">{copy.email}: </span>
              {email}
            </p>
          ) : null}
          {phone ? (
            <p className="mt-1 text-stone-700">
              <span className="font-semibold">{phoneLabel}: </span>
              {phone}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
