// Placeholder blocks while the profile is loading.

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4" aria-busy="true">
      <div className="card h-36 animate-pulse bg-stone-100" />
      <div className="card h-56 animate-pulse bg-stone-100" />
      <div className="card h-40 animate-pulse bg-stone-100" />
    </div>
  );
}
