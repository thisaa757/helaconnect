"use client";

// Sample notifications: a like, a reaction, a repost, and a comment on a post.

import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";

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

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t("notificationsTitle", lang)}</h1>
        <p className="text-stone-700">{t("notificationsIntro", lang)}</p>
      </header>
      <ul className="space-y-3">
        {NOTES.map((note) => (
          <li key={note.id} className="card space-y-2">
            <p>
              <span className="font-bold">{note.name}</span> {t(note.action, lang)}
            </p>
            {note.quote ? <p className="rounded-xl bg-[#F5EDE3] px-3 py-2 text-stone-800">{note.quote}</p> : null}
            <p className="text-sm text-stone-600">{t(note.time, lang)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
