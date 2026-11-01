// The feed starts with a prompt that opens the post form.

import Link from "next/link";
import { initials } from "@/lib/profile/validate";

export function Composer({ name, prompt }: { name: string; prompt: string }) {
  return (
    <Link href="/work" className="card flex items-center gap-3 no-underline transition hover:border-[#2F3A7A]">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#2F3A7A] text-sm font-bold text-white"
      >
        {initials(name || "You")}
      </span>
      <span className="flex min-h-12 flex-1 items-center rounded-full border border-stone-300 px-4 text-stone-500">{prompt}</span>
    </Link>
  );
}
