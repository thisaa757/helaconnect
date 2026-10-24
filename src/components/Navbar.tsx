"use client";

// Top bar for the pages after the opening screen.
// Log in and Sign up stay on the opening page, not here.

import Link from "next/link";
import { usePathname } from "next/navigation";

const APP_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/suggested", label: "Suggested" },
  { href: "/work", label: "Post" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-secondary text-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/home" className="flex items-center gap-2 text-xl font-bold text-primary no-underline">
            <img src="/hela-connect-logo.jpg" alt="" className="h-11 w-11 rounded-xl bg-white object-cover" />
            Hela-Connect
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {APP_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-base font-semibold no-underline ${
                  active ? "bg-primary text-secondary" : "text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
