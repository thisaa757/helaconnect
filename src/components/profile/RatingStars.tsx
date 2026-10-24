"use client";

// Read-only stars, or a 1 to 5 radio group when the person is leaving a rating.

import { fill, type ProfileCopy } from "@/lib/profile/translations";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-7 w-7 ${filled ? "text-amber-500" : "text-stone-300"}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.2l2.4 5.2 5.7.7-4.2 3.9 1.1 5.6L12 15.8 6.9 18.6l1.1-5.6L3.8 9.1l5.7-.7L12 3.2z"
      />
    </svg>
  );
}

export function RatingStars({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={label}>
      <span aria-hidden="true" className="inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={value >= star - 0.25} />
        ))}
      </span>
      <span className="font-semibold">{value.toFixed(1)}</span>
    </span>
  );
}

export function RatingStarsInput({
  value,
  onChange,
  copy,
  legend,
  invalid,
  describedBy,
}: {
  value: number;
  onChange: (stars: number) => void;
  copy: ProfileCopy;
  legend: string;
  invalid: boolean;
  describedBy?: string;
}) {
  return (
    <fieldset>
      <legend className="text-xl font-bold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-invalid={invalid} aria-describedby={describedBy}>
        {[1, 2, 3, 4, 5].map((star) => {
          const selected = value === star;
          const label = fill(star === 1 ? copy.starOption : copy.starOptions, { count: star });
          return (
            <label
              key={star}
              className={`inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-xl border-2 ${
                selected ? "border-[#2F3A7A] bg-[#F5EDE3]" : "border-transparent"
              } focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2F3A7A]`}
            >
              <input
                className="sr-only"
                type="radio"
                name="profile-stars"
                value={star}
                checked={selected}
                aria-label={label}
                onChange={() => onChange(star)}
              />
              <Star filled={value >= star && value > 0} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
