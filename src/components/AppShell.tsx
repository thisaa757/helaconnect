"use client";

// The opening auth screen is full-page. Every other route keeps the top bar.

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

const OPENING = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (OPENING.has(pathname)) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
