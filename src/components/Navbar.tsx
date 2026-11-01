"use client";

// Logo and search stay in the top bar. The five sections live in a bottom bar on every screen size.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { getServerUnreadCount, getUnreadCount, subscribeUnread } from "@/lib/notifications/seen";

const LINKS = [
  { href: "/home", labelKey: "home", icon: "home" },
  { href: "/suggested", labelKey: "navSuggested", icon: "spark" },
  { href: "/work", labelKey: "postTitle", icon: "plus" },
  { href: "/notifications", labelKey: "navNotifications", icon: "bell" },
  { href: "/profile", labelKey: "navProfile", icon: "user" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const unread = useSyncExternalStore(subscribeUnread, getUnreadCount, getServerUnreadCount);
  const [query, setQuery] = useState("");

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    router.push(text ? `/home?q=${encodeURIComponent(text)}` : "/home");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
          <Link href="/home" className="flex shrink-0 items-center gap-2 text-lg font-bold text-[#2F3A7A] no-underline">
            <img src="/hela-connect-logo.jpg" alt="" className="h-9 w-9 rounded-lg bg-[#F5EDE3] object-cover" />
            <span className="hidden sm:inline">Hela-Connect</span>
          </Link>
          <form onSubmit={search} className="min-w-0 max-w-xl flex-1" role="search">
            <label className="sr-only" htmlFor="nav-search">
              {t("searchLabel", lang)}
            </label>
            <input
              id="nav-search"
              type="search"
              value={query}
              placeholder={t("searchPlaceholder", lang)}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-stone-300 bg-[#f3f2ef] px-4 text-sm outline-none focus-visible:border-[#2F3A7A] focus-visible:ring-2 focus-visible:ring-[#2F3A7A]"
            />
          </form>
        </div>
      </header>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]"
        aria-label={t("home", lang)}
      >
        <ul className="grid grid-cols-5">
          {LINKS.map((link) => (
            <li key={link.href}>
              <NavLink {...link} pathname={pathname} label={t(link.labelKey, lang)} unread={link.icon === "bell" ? unread : 0} />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function NavLink({
  href,
  pathname,
  label,
  icon,
  unread,
}: {
  href: string;
  pathname: string;
  label: string;
  icon: (typeof LINKS)[number]["icon"];
  unread: number;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] ${
        active ? "text-[#2F3A7A]" : "text-stone-400"
      }`}
    >
      <Icon name={icon} active={active} />
      <span className="text-[13px] font-semibold leading-none">{label}</span>
      {unread > 0 ? (
        <span className="absolute right-[28%] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#b42318] px-1 text-[10px] font-bold text-white">
          {unread}
        </span>
      ) : null}
    </Link>
  );
}

function Icon({ name, active }: { name: (typeof LINKS)[number]["icon"]; active: boolean }) {
  const common = "h-7 w-7";
  const fill = active ? "currentColor" : "none";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M12 3.5 13.8 9H19l-4.2 3.2 1.6 5.3L12 14.8 7.6 17.5l1.6-5.3L5 9h5.2L12 3.5Z" fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill={fill} stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v8M8 12h8" stroke={active ? "white" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
        <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.2 1.5H4.8L6 16.5Z" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.2" fill={fill} stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19.2c1.4-2.8 3.6-4 6.5-4s5.1 1.2 6.5 4" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
