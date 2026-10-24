"use client";

// Worker job feed. A signed-in worker is checked by the API.
// Without a session, the role buttons are a labelled demo and are not authentication.

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { getProfileDraft, getServerProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { suggestedInterestsIn } from "@/lib/suggested/samples";
import type { SuggestedComment, SuggestedFeedResponse, SuggestedPost, SuggestedReactions } from "@/lib/suggested/types";
import type { Lang } from "@/lib/types";

const ROLE_KEY = "wedamate-demo-role";
const ACTOR_KEY = "wedamate-demo-actor";
const NAME_KEY = "wedamate-demo-name";
const ACTOR_PATTERN = /^demo-[a-z0-9]{20}$/;

type DemoRole = "worker" | "customer";

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing can block storage. The choice still works for this visit.
  }
}

function demoActor(): string {
  const existing = readStorage(ACTOR_KEY);
  if (ACTOR_PATTERN.test(existing)) return existing;
  const next = `demo-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  writeStorage(ACTOR_KEY, next);
  return next;
}

function demoRole(): DemoRole {
  return readStorage(ROLE_KEY) === "customer" ? "customer" : "worker";
}

function demoName(): string {
  const saved = readStorage(NAME_KEY).trim();
  return saved.length >= 2 ? saved.slice(0, 60) : "Demo worker";
}

function actorFromEmail(email: string): string {
  let hash = 2166136261;
  for (const char of email.toLowerCase()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const body = (hash >>> 0).toString(16).padStart(8, "0");
  const rest = email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .padEnd(12, "0")
    .slice(0, 12);
  return `demo-${body}${rest}`;
}

function formatWhen(value: string, lang: Lang): string {
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  const locale = lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-LK";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function tradeLabel(trade: string, lang: Lang): string {
  const key = `trade.${trade}`;
  const label = t(key, lang);
  return label === key ? trade : label;
}

export function SuggestedFeed({ page }: { page: "home" | "suggested" }) {
  const { lang } = useLang();
  const account = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const onHome = page === "home";
  const interestIds = onHome ? null : suggestedInterestsIn(account.interests);
  const interestKey = interestIds ? interestIds.join(",") : "";
  const needsInterest = interestIds !== null && interestIds.length === 0;
  const [ready, setReady] = useState(onHome);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<DemoRole>("worker");
  const [actor, setActor] = useState("");
  const [displayName, setDisplayName] = useState("Demo worker");
  const [area, setArea] = useState("");
  const [trade, setTrade] = useState("");
  const [query, setQuery] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [jobs, setJobs] = useState<SuggestedPost[]>([]);
  const [access, setAccess] = useState<"authenticated" | "demo" | null>(null);
  const [blocked, setBlocked] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (onHome) return;
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      let nextToken: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        nextToken = data.session?.access_token ?? null;
      }
      if (cancelled) return;
      setToken(nextToken);
      setRole(demoRole());
      setActor(demoActor());
      setDisplayName(demoName());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [onHome]);

  const feedRole = onHome ? "worker" : role;
  const feedToken = onHome ? null : token;
  const feedActor = onHome ? actorFromEmail(account.email || account.values.fullName || "worker") : actor;
  const feedName = onHome ? account.values.fullName.trim() || "Worker" : displayName;

  useEffect(() => {
    if (!ready || !feedActor || needsInterest) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (trade) params.set("trade", trade);
    if (query.trim()) params.set("q", query.trim());
    if (!onHome) params.set("interests", interestKey);
    const headers: Record<string, string> = {};
    if (feedToken) headers.Authorization = `Bearer ${feedToken}`;
    else {
      headers["x-weda-demo-role"] = feedRole;
      headers["x-weda-demo-actor"] = feedActor;
    }
    fetch(`/api/suggested${params.size ? `?${params}` : ""}`, { headers, cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as SuggestedFeedResponse | null;
        if (controller.signal.aborted) return;
        setError("");
        if (!res.ok) {
          const message = data?.error || t("feedError", lang);
          if (res.status === 403) {
            setJobs([]);
            const denied =
              data?.access === "authenticated"
                ? t("customerBlockedAuth", lang)
                : data?.role === "customer"
                  ? t("customerBlocked", lang)
                  : message;
            setBlocked(denied);
            setAccess(data?.access ?? (feedToken ? "authenticated" : "demo"));
            setError("");
            return;
          }
          throw new Error(message);
        }
        if (!data) throw new Error(t("feedError", lang));
        setBlocked("");
        setAccess(data.access);
        setJobs(data.jobs);
        setAreas(data.areas);
        setTrades(data.trades);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setJobs([]);
        setError(err instanceof Error ? err.message : t("feedError", lang));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ready, feedActor, feedRole, feedToken, area, trade, query, reloadKey, lang, needsInterest, onHome, interestKey]);

  function chooseRole(next: DemoRole) {
    setLoading(true);
    setRole(next);
    writeStorage(ROLE_KEY, next);
    if (next === "customer") setJobs([]);
  }

  const filtered = Boolean(area || trade || query.trim());
  const showFeed = !blocked && access !== null;
  const title = page === "home" ? t("home", lang) : t("feedTitle", lang);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-stone-700">{onHome ? t("feedIntro", lang) : t("suggestedIntro", lang)}</p>
      </header>

      {!onHome && token && access === "authenticated" && !blocked ? (
        <p className="rounded-2xl border border-[#2F3A7A]/20 bg-white px-4 py-3 text-sm text-stone-700">{t("signedInWorker", lang)}</p>
      ) : null}

      {needsInterest ? (
        <section className="card space-y-3">
          <p className="text-stone-700">{t("suggestedNeedsInterest", lang)}</p>
          <Link
            href="/interests"
            className="inline-flex min-h-12 items-center rounded-xl bg-[#2F3A7A] px-4 font-bold text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A]"
          >
            {t("suggestedEditInterests", lang)}
          </Link>
        </section>
      ) : null}

      {!needsInterest && !onHome && !token ? (
        <section className="card space-y-3" aria-labelledby="demo-role-heading">
          <h2 id="demo-role-heading" className="text-lg font-bold">
            {t("demoRole", lang)}
          </h2>
          <p className="text-sm text-stone-700">{t("demoBanner", lang)}</p>
          <p className="text-sm text-stone-600">{t("demoLimitation", lang)}</p>
          <div role="radiogroup" aria-labelledby="demo-role-heading" className="grid grid-cols-2 gap-2">
            {(["worker", "customer"] as const).map((option) => {
              const selected = role === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseRole(option)}
                  className={`min-h-12 rounded-xl border-2 px-3 text-base font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] ${
                    selected ? "border-[#2F3A7A] bg-[#2F3A7A] text-white" : "border-stone-300 bg-white text-stone-900"
                  }`}
                >
                  {option === "worker" ? t("workerRole", lang) : t("customerRole", lang)}
                </button>
              );
            })}
          </div>
          <label className="block space-y-1 text-sm font-semibold">
            {t("demoName", lang)}
            <input
              className="field"
              value={displayName}
              maxLength={60}
              onChange={(event) => {
                setDisplayName(event.target.value);
                writeStorage(NAME_KEY, event.target.value.trim());
              }}
            />
          </label>
        </section>
      ) : null}

      {blocked ? (
        <p role="alert" className="card text-stone-800">
          {blocked}
        </p>
      ) : null}

      {!needsInterest && (!ready || (loading && access === null && !blocked && !error)) ? <FeedSkeleton /> : null}

      {!needsInterest && error ? (
        <div role="alert" className="card space-y-3 text-red-800">
          <p>{error}</p>
          <button
            type="button"
            className="min-h-12 rounded-xl bg-[#2F3A7A] px-4 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A]"
            onClick={() => {
              setLoading(true);
              setReloadKey((value) => value + 1);
            }}
          >
            {t("feedRetry", lang)}
          </button>
        </div>
      ) : null}

      {!needsInterest && showFeed ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold">
              {t("area", lang)}
              <select
                className="field"
                value={area}
                onChange={(event) => {
                  setLoading(true);
                  setArea(event.target.value);
                }}
              >
                <option value="">{t("all", lang)}</option>
                {areas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              {t("feedJobRole", lang)}
              <select
                className="field"
                value={trade}
                onChange={(event) => {
                  setLoading(true);
                  setTrade(event.target.value);
                }}
              >
                <option value="">{t("all", lang)}</option>
                {trades.map((item) => (
                  <option key={item} value={item}>
                    {tradeLabel(item, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold sm:col-span-2">
              {t("feedSearch", lang)}
              <input
                className="field"
                type="search"
                value={query}
                onChange={(event) => {
                  setLoading(true);
                  setQuery(event.target.value);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-semibold text-stone-700">
              {loading ? t("loading", lang) : `${jobs.length} ${jobs.length === 1 ? t("feedJob", lang) : t("feedJobs", lang)}`}
            </p>
            <button
              type="button"
              className="min-h-12 rounded-xl border-2 border-[#2F3A7A] bg-white px-4 font-bold text-[#2F3A7A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] disabled:opacity-55"
              onClick={() => {
                setLoading(true);
                setArea("");
                setTrade("");
                setQuery("");
              }}
              disabled={!filtered}
            >
              {t("clearFilters", lang)}
            </button>
          </div>

          {loading ? <FeedSkeleton /> : null}
          {!loading && !error && jobs.length === 0 ? (
            <p className="card text-stone-700">{filtered ? t("noFilterResults", lang) : t("noJobs", lang)}</p>
          ) : null}
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={job}
                  lang={lang}
                  headers={
                    feedToken
                      ? { Authorization: `Bearer ${feedToken}` }
                      : { "x-weda-demo-role": feedRole, "x-weda-demo-actor": feedActor, "x-weda-demo-name": feedName }
                  }
                  onReactions={(reactions) => {
                    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, reactions } : item)));
                  }}
                  onComment={(comment) => {
                    setJobs((current) =>
                      current.map((item) => (item.id === job.id ? { ...item, comments: [...item.comments, comment] } : item)),
                    );
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="card h-40 animate-pulse bg-stone-100" />
      <div className="card h-40 animate-pulse bg-stone-100" />
    </div>
  );
}

function JobCard({
  job,
  lang,
  headers,
  onReactions,
  onComment,
}: {
  job: SuggestedPost;
  lang: Lang;
  headers: Record<string, string>;
  onReactions: (reactions: SuggestedReactions) => void;
  onComment: (comment: SuggestedComment) => void;
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [reacting, setReacting] = useState<"like" | "interested" | null>(null);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");

  async function toggle(kind: "like" | "interested") {
    if (reacting) return;
    setReacting(kind);
    setProblem("");
    try {
      const res = await fetch(`/api/suggested/${job.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ reaction: kind }),
      });
      const data = (await res.json().catch(() => null)) as { reactions?: SuggestedReactions; error?: string } | null;
      if (!res.ok || !data?.reactions) throw new Error(data?.error || t("reactionFailed", lang));
      onReactions(data.reactions);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : t("reactionFailed", lang));
    } finally {
      setReacting(null);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const text = draft.trim();
    setProblem("");
    setNote("");
    if (!text) {
      setProblem(t("commentEmpty", lang));
      return;
    }
    if (Array.from(text).length > 400) {
      setProblem(t("commentTooLong", lang));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/suggested/${job.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json().catch(() => null)) as { comment?: SuggestedComment; error?: string } | null;
      if (!res.ok || !data?.comment) throw new Error(data?.error || t("commentFailed", lang));
      onComment(data.comment);
      setDraft("");
      setNote(t("commentSaved", lang));
    } catch (err) {
      setProblem(err instanceof Error ? err.message : t("commentFailed", lang));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card space-y-3">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">{job.title}</h2>
        <p className="text-sm font-semibold text-[#2F3A7A]">
          {tradeLabel(job.trade, lang)} · {job.area}
        </p>
      </div>
      <p className="whitespace-pre-wrap text-stone-800">{job.description}</p>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-stone-500">{t("feedPosted", lang)}</dt>
          <dd>{formatWhen(job.created_at, lang)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-stone-500">{t("postedBy", lang)}</dt>
          <dd>{job.posted_by}</dd>
        </div>
        {job.timeframe ? (
          <div>
            <dt className="font-semibold text-stone-500">{t("timeframe", lang)}</dt>
            <dd>{job.timeframe}</dd>
          </div>
        ) : null}
        {job.size_estimate ? (
          <div>
            <dt className="font-semibold text-stone-500">{t("size", lang)}</dt>
            <dd>{job.size_estimate}</dd>
          </div>
        ) : null}
      </dl>

      <div className="grid grid-cols-2 gap-2">
        <ReactionButton
          kind="like"
          label={t("like", lang)}
          count={job.reactions.like}
          pressed={job.reactions.mine.like}
          disabled={reacting !== null}
          onClick={() => void toggle("like")}
        />
        <ReactionButton
          kind="interested"
          label={t("interested", lang)}
          count={job.reactions.interested}
          pressed={job.reactions.mine.interested}
          disabled={reacting !== null}
          onClick={() => void toggle("interested")}
        />
      </div>

      <section className="space-y-2" aria-labelledby={`comments-${job.id}`}>
        <h3 id={`comments-${job.id}`} className="text-base font-bold">
          {t("feedComments", lang)}
        </h3>
        {job.comments.length === 0 ? <p className="text-sm text-stone-600">{t("noFeedComments", lang)}</p> : null}
        <ul className="space-y-2">
          {job.comments.map((comment) => (
            <li key={comment.id} className="rounded-xl bg-[#F5EDE3] px-3 py-2">
              <p className="text-sm font-semibold">
                {comment.author_name} · {formatWhen(comment.created_at, lang)}
              </p>
              <p className="whitespace-pre-wrap">{comment.body}</p>
            </li>
          ))}
        </ul>
        <form className="space-y-2" onSubmit={(event) => void submit(event)}>
          <label className="block space-y-1 text-sm font-semibold" htmlFor={`comment-${job.id}`}>
            {t("feedComments", lang)}
            <textarea
              id={`comment-${job.id}`}
              className="field min-h-24"
              value={draft}
              maxLength={400}
              placeholder={t("commentPlaceholder", lang)}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-[#2F3A7A] px-4 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] disabled:opacity-55 sm:w-auto"
            disabled={saving}
          >
            {saving ? t("saving", lang) : t("postComment", lang)}
          </button>
        </form>
        {note ? (
          <p role="status" className="text-sm font-semibold text-[#2F3A7A]">
            {note}
          </p>
        ) : null}
        {problem ? (
          <p role="alert" className="text-sm font-semibold text-red-800">
            {problem}
          </p>
        ) : null}
      </section>
    </article>
  );
}

function ReactionButton({
  kind,
  label,
  count,
  pressed,
  disabled,
  onClick,
}: {
  kind: "like" | "interested";
  label: string;
  count: number;
  pressed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const mark = kind === "like" ? "👍" : "❤️";
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${label}, ${count}`}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 rounded-xl border-2 px-3 text-base font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] disabled:opacity-55 ${
        pressed ? "border-[#2F3A7A] bg-[#2F3A7A] text-white" : "border-stone-300 bg-white text-stone-900"
      }`}
    >
      <span aria-hidden="true">{mark}</span> {label} {count}
    </button>
  );
}
