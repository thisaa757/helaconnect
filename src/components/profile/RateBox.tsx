"use client";

// One rating from a logged-in person of the other role. They can update it later.

import { useState } from "react";
import { RatingStarsInput } from "@/components/profile/RatingStars";
import { controlClass, primaryButtonClass } from "@/components/profile/ui";
import { saveRating } from "@/lib/profile/client";
import type { ProfileCopy } from "@/lib/profile/translations";
import { textLength, validateRating } from "@/lib/profile/validate";

export function RateBox({
  profileId,
  existing,
  copy,
  onSaved,
}: {
  profileId: string;
  existing: { stars: number; comment: string } | null;
  copy: ProfileCopy;
  onSaved: () => void;
}) {
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [errors, setErrors] = useState<{ stars?: "stars"; comment?: "commentLength" }>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const commentErrorId = errors.comment ? "rating-comment-error" : undefined;
  const starsErrorId = errors.stars ? "rating-stars-error" : undefined;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const found = validateRating(stars, comment);
    if (found) {
      setErrors(found);
      return;
    }
    setErrors({});
    setSaving(true);
    const result = await saveRating(profileId, stars, comment);
    setSaving(false);
    if (!result.ok) {
      if (result.fields) setErrors(result.fields);
      if (result.error === "self") setFormError(copy.cannotRateSelf);
      else if (result.error === "sameRole") setFormError(copy.sameRole);
      else if (result.error === "auth") setFormError(copy.sessionExpired);
      else setFormError(copy.ratingError);
      return;
    }
    onSaved();
  }

  return (
    <section className="card">
      <form className="space-y-3" onSubmit={submit} noValidate>
        <RatingStarsInput
          value={stars}
          legend={existing ? copy.updateRating : copy.rateTitle}
          copy={copy}
          invalid={Boolean(errors.stars)}
          describedBy={starsErrorId}
          onChange={(next) => {
            setStars(next);
            setErrors((current) => ({ ...current, stars: undefined }));
          }}
        />
        {errors.stars ? (
          <p id="rating-stars-error" className="text-sm font-medium text-red-700">
            {copy.errors.stars}
          </p>
        ) : null}
        <div className="space-y-1">
          <label className="block text-base font-semibold" htmlFor="rating-comment">
            {copy.comment}
          </label>
          <textarea
            id="rating-comment"
            className={`${controlClass} min-h-28 py-3`}
            value={comment}
            placeholder={copy.commentPlaceholder}
            aria-invalid={Boolean(errors.comment)}
            aria-describedby={["rating-comment-count", commentErrorId].filter(Boolean).join(" ")}
            onChange={(event) => setComment(event.target.value)}
          />
          <p id="rating-comment-count" aria-live="polite" className={`text-sm ${textLength(comment) > 200 ? "font-semibold text-red-700" : "text-stone-600"}`}>
            {textLength(comment)}/200
          </p>
          {errors.comment ? (
            <p id="rating-comment-error" className="text-sm font-medium text-red-700">
              {copy.errors.commentLength}
            </p>
          ) : null}
        </div>
        {formError ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {formError}
          </p>
        ) : null}
        <button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? copy.saving : copy.submitRating}
        </button>
      </form>
    </section>
  );
}
