"use client";

// The opening auth screen is full-page. Every other route keeps the app frame.

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { IdentityRail, NearbyRail } from "@/components/shell/SideRails";

const OPENING = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (OPENING.has(pathname)) return <>{children}</>;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <div className="mx-auto grid w-full max-w-[1128px] flex-1 grid-cols-1 items-start gap-6 px-4 py-4 pb-24 lg:grid-cols-[225px_minmax(0,1fr)_300px]">
        <IdentityRail />
        <main className="min-w-0">{children}</main>
        <NearbyRail />
      </div>
    </div>
  );
}
