// The five most recent ratings. Display only: the owner cannot edit or delete them.

import { RatingStars } from "@/components/profile/RatingStars";
import { fill, type ProfileCopy } from "@/lib/profile/translations";
import type { ReviewItem } from "@/lib/profile/types";
import type { Lang } from "@/lib/types";

function formatReviewDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const locale = lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-LK";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function ReviewList({
  reviews,
  error,
  copy,
  lang,
}: {
  reviews: ReviewItem[];
  error: boolean;
  copy: ProfileCopy;
  lang: Lang;
}) {
  return (
    <section className="card space-y-3" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-bold">
        {copy.reviews}
      </h2>
      {error ? (
        <p role="alert" className="text-red-800">
          {copy.ratingsError}
        </p>
      ) : null}
      {!error && reviews.length === 0 ? <p className="text-stone-600">{copy.noRatings}</p> : null}
      {reviews.length > 0 ? (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const label = fill(copy.starsLabel, { value: review.stars.toFixed(1) });
            return (
              <li key={review.id} className="rounded-2xl border border-stone-200 p-3">
                <RatingStars value={review.stars} label={label} />
                <p className="mt-2 whitespace-pre-wrap">{review.comment?.trim() ? review.comment : copy.noComment}</p>
                <p className="mt-2 text-sm text-stone-600">
                  <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt, lang)}</time>
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
