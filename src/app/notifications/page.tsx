"use client";

// Sample notifications: a like, a reaction, a repost, and a comment on a post.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { getUnreadCount, markNotificationsRead } from "@/lib/notifications/seen";
import { initials } from "@/lib/profile/validate";

const NOTES = [
  { id: "like", name: "Kumari Silva", action: "noteLiked", time: "noteTime2h", quote: "" },
  { id: "react", name: "Rajan Krishnan", action: "noteReacted", time: "noteTime5h", quote: "" },
  { id: "repost", name: "Fathima Nazeer", action: "noteReposted", time: "noteTimeYesterday", quote: "" },
  {
    id: "comment",
    name: "Sunil Jayawardena",
    action: "noteCommented",
    time: "noteTimeYesterday",
    quote: "I can start this Saturday morning.",
  },
] as const;

export default function NotificationsPage() {
  const { lang } = useLang();
  const [fresh, setFresh] = useState(true);

  useEffect(() => {
    setFresh(getUnreadCount() > 0);
    markNotificationsRead();
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <header className="px-1">
        <h1 className="text-2xl font-bold">{t("notificationsTitle", lang)}</h1>
        <p className="text-sm text-stone-600">{t("notificationsIntro", lang)}</p>
      </header>
      <ul className="card divide-y divide-stone-200 overflow-hidden" style={{ padding: 0 }}>
        {NOTES.map((note) => (
          <li key={note.id}>
            <Link
              href="/home"
              className={`flex items-start gap-3 px-4 py-3 no-underline ${fresh ? "bg-[#F5EDE3]/70" : "bg-white"}`}
            >
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2F3A7A] text-sm font-bold text-white"
              >
                {initials(note.name)}
              </span>
              <span className="min-w-0 flex-1 text-stone-900">
                <span className="block">
                  <span className="font-bold">{note.name}</span> {t(note.action, lang)}
                </span>
                {note.quote ? <span className="mt-1 block text-sm text-stone-700">“{note.quote}”</span> : null}
                <span className="mt-1 block text-xs font-semibold text-stone-500">{t(note.time, lang)}</span>
              </span>
              {fresh ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2F3A7A]" aria-label={t("notificationsNew", lang)} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
