"use client";

// Read-only stars for a profile average or a review.

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
