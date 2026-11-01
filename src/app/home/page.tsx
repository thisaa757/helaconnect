// Home is the job feed for a worker and nearby people for everyone else.

import { Suspense } from "react";
import { HomeScreen } from "@/components/home/HomeScreen";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="card h-40 animate-pulse bg-stone-100" aria-hidden="true" />}>
      <HomeScreen />
    </Suspense>
  );
}
