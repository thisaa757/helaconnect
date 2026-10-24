"use client";

// First screen: welcome, then a demo login or signup form.
// Nothing here creates a real session. A valid form only opens Home.

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type View = "welcome" | "login" | "signup";
type Role = "worker" | "customer" | "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Palette = "teal" | "home";

const home = {
  page: "bg-[#F5EDE3] text-[#1c1917]",
  accent: "text-[#2F3A7A]",
  button: "bg-[#2F3A7A] text-white hover:bg-[#24306a]",
  input: "border-stone-300 focus:border-[#2F3A7A] focus-visible:ring-2 focus-visible:ring-[#2F3A7A]",
  blobA: "bg-[#2F3A7A]/15",
  blobB: "bg-[#2F3A7A]/10",
  lang: "home" as const,
};

const teal = {
  page: "bg-[#FAF7F0] text-[#0F172A]",
  accent: "text-[#0F766E]",
  button: "bg-[#0F766E] text-white hover:bg-[#115E59]",
  input: "border-[#E2E8F0] focus:border-[#0F766E]",
  blobA: "bg-[#0F766E]/15",
  blobB: "bg-[#F59E0B]/20",
  lang: "light" as const,
};

export function AuthGate({ initialView = "welcome", palette = "home" }: { initialView?: View; palette?: Palette }) {
  const [view, setView] = useState<View>(initialView);
  const colors = view === "login" || palette === "home" ? home : teal;
  const { lang } = useLang();
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [role, setRole] = useState<Role>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  function open(next: View) {
    setErrors({});
    setView(next);
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!EMAIL.test(email.trim())) next.email = t("errEmail", lang);
    if (password.length < 8) next.password = t("errPassword", lang);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.push("/home");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (error) {
      setErrors({ form: t("errLogin", lang) });
      return;
    }
    router.push("/home");
  }

  function submitSignup(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t("errName", lang);
    if (!EMAIL.test(email.trim())) next.email = t("errEmail", lang);
    if (password.length < 8) next.password = t("errPassword", lang);
    if (password !== confirm) next.confirm = t("errMatch", lang);
    if (!role) next.role = t("errRole", lang);
    setErrors(next);
    if (Object.keys(next).length === 0) router.push("/home");
  }

  return (
    <div className={`relative min-h-dvh overflow-hidden ${colors.page}`}>
      {view === "login" ? null : <Background blobA={colors.blobA} blobB={colors.blobB} />}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
        {view === "welcome" ? (
          <Welcome headingRef={headingRef} onLogin={() => open("login")} onSignup={() => router.push("/signup")} />
        ) : (
          <section
            className={`wm-panel rounded-3xl bg-white p-5 sm:p-7 ${
              view === "login"
                ? "border border-stone-200 shadow-[0_16px_40px_rgba(47,58,122,0.08)]"
                : "border border-[#E2E8F0] shadow-sm"
            }`}
          >
            <button type="button" onClick={() => open("welcome")} className={`mb-4 text-base font-semibold underline-offset-4 hover:underline ${colors.accent}`}>
              ← {t("authBack", lang)}
            </button>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className={`text-3xl outline-none ${view === "login" ? "font-black tracking-tight" : "font-bold"}`}
            >
              {view === "login" ? t("logIn", lang) : t("createAccount", lang)}
            </h1>

            {view === "login" ? (
              <form className="mt-5 space-y-4" onSubmit={submitLogin} noValidate>
                <Field id="login-email" label={t("email", lang)} type="email" value={email} autoComplete="email" error={errors.email} onChange={setEmail} inputClass={colors.input} />
                <PasswordField id="login-password" label={t("password", lang)} value={password} shown={showPassword} error={errors.password} onChange={setPassword} onToggle={() => setShowPassword((v) => !v)} inputClass={colors.input} accentClass={colors.accent} />
                {errors.form ? (
                  <p role="alert" className="text-sm font-medium text-red-700">
                    {errors.form}
                  </p>
                ) : null}
                <button type="submit" disabled={submitting} className={`wm-btn wm-btn-navy mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-lg font-bold disabled:opacity-55 ${colors.button}`}>
                  {submitting ? t("loading", lang) : t("logIn", lang)}
                  <Arrow />
                </button>
                <button type="button" className={`min-h-11 w-full text-base font-semibold ${colors.accent}`} onClick={() => router.push("/signup")}>
                  {t("switchToSignup", lang)}
                </button>
                <div className="flex justify-center pt-1">
                  <GoogleLogo />
                </div>
              </form>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={submitSignup} noValidate>
                <Field id="signup-name" label={t("name", lang)} type="text" value={name} autoComplete="name" error={errors.name} onChange={setName} inputClass={colors.input} />
                <Field id="signup-email" label={t("email", lang)} type="email" value={email} autoComplete="email" error={errors.email} onChange={setEmail} inputClass={colors.input} />
                <PasswordField id="signup-password" label={t("password", lang)} value={password} shown={showPassword} error={errors.password} onChange={setPassword} onToggle={() => setShowPassword((v) => !v)} inputClass={colors.input} accentClass={colors.accent} />
                <PasswordField id="signup-confirm" label={t("confirmPassword", lang)} value={confirm} shown={showPassword} error={errors.confirm} onChange={setConfirm} onToggle={() => setShowPassword((v) => !v)} inputClass={colors.input} accentClass={colors.accent} />
                <fieldset className="space-y-2">
                  <legend className="text-base font-semibold">{t("roleLabel", lang)}</legend>
                  <RoleChoice role={role} onRole={setRole} compact />
                  {errors.role ? <p className="text-sm font-medium text-red-700">{errors.role}</p> : null}
                </fieldset>
                <button type="submit" className={`wm-btn mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-lg font-bold ${colors.button}`}>
                  {t("createAccount", lang)}
                  <Arrow />
                </button>
                <button type="button" className={`min-h-11 w-full text-base font-semibold ${colors.accent}`} onClick={() => open("login")}>
                  {t("switchToLogin", lang)}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Welcome({
  headingRef,
  onLogin,
  onSignup,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onLogin: () => void;
  onSignup: () => void;
}) {
  const { lang } = useLang();
  return (
    <div>
      <div className="wm-logo mb-6 flex items-center gap-3">
        <img src="/hela-connect-logo.jpg" alt="" className="h-14 w-14 rounded-2xl bg-white object-cover shadow-md" />
        <span className="text-2xl font-bold tracking-tight text-[#2F3A7A]">Hela-Connect</span>
      </div>
      <div className="wm-copy">
        <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-bold leading-tight text-[#2F3A7A] outline-none">
          {t("welcomeHeadline", lang)}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-stone-700">{t("welcomeBody", lang)}</p>
      </div>
      <div className="wm-actions mt-6 grid gap-3">
        <button type="button" onClick={onLogin} className="wm-btn wm-btn-navy flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2F3A7A] px-5 text-lg font-bold text-[#F5EDE3] hover:bg-[#24306a]">
          {t("logIn", lang)}
          <Arrow />
        </button>
        <button type="button" onClick={onSignup} className="wm-btn flex min-h-14 items-center justify-center rounded-2xl border-2 border-[#2F3A7A] bg-[#F5EDE3] px-5 text-lg font-bold text-[#2F3A7A] hover:bg-white">
          {t("createAccount", lang)}
        </button>
      </div>
      <p className="wm-trust mt-6 text-center text-sm font-semibold tracking-wide text-stone-600">
        {t("madeFor", lang)} · {t("yourSkills", lang)}
      </p>
    </div>
  );
}

function RoleChoice({ role, onRole, compact = false }: { role: Role; onRole: (role: Role) => void; compact?: boolean }) {
  const { lang } = useLang();
  const label = useId();
  const options: { id: Role; title: string; hint: string }[] = [
    { id: "worker", title: compact ? t("workerRole", lang) : t("imWorker", lang), hint: t("imWorkerHint", lang) },
    { id: "customer", title: compact ? t("customerRole", lang) : t("needWorker", lang), hint: t("needWorkerHint", lang) },
  ];
  return (
    <div role="radiogroup" aria-labelledby={label} className="grid gap-3">
      <span id={label} className="sr-only">
        {t("roleLabel", lang)}
      </span>
      {options.map((option) => {
        const selected = role === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onRole(option.id)}
            className={`wm-card rounded-2xl border bg-white p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F3A7A] ${
              selected ? "border-[#2F3A7A] shadow-sm" : "border-stone-300"
            }`}
          >
            <span className="block text-lg font-bold">{option.title}</span>
            {compact ? null : <span className="mt-1 block text-base text-stone-600">{option.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
  inputClass,
  large = false,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
  inputClass: string;
  large?: boolean;
}) {
  return (
    <label className={`block font-semibold ${large ? "space-y-2 text-lg" : "space-y-1 text-base"}`} htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-white font-normal outline-none ${large ? "min-h-16 px-4 text-lg" : "min-h-12 px-3 text-base"} ${inputClass}`}
      />
      {error ? (
        <span id={`${id}-error`} className="block text-sm font-medium text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function PasswordField({
  id,
  label,
  value,
  shown,
  error,
  onChange,
  onToggle,
  inputClass,
  accentClass,
  large = false,
}: {
  id: string;
  label: string;
  value: string;
  shown: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  inputClass: string;
  accentClass: string;
  large?: boolean;
}) {
  const { lang } = useLang();
  return (
    <div className={large ? "space-y-2" : "space-y-1"}>
      <label className={`block font-semibold ${large ? "text-lg" : "text-base"}`} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border bg-white font-normal outline-none ${large ? "min-h-16 px-4 pr-16 text-lg" : "min-h-12 px-3 pr-14 text-base"} ${inputClass}`}
        />
        <button
          type="button"
          aria-label={shown ? t("hidePassword", lang) : t("showPassword", lang)}
          aria-pressed={shown}
          onClick={onToggle}
          className={`absolute inset-y-1 right-1 grid place-items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${large ? "w-14" : "w-12"} ${accentClass}`}
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" role="img" aria-label="Google">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 34 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function Eye() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.1 6.8C3.6 8.6 2 12 2 12s3.5 6 10 6c1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <span className="wm-arrow" aria-hidden="true">
      →
    </span>
  );
}

function Background({ blobA, blobB }: { blobA: string; blobB: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className={`wm-float absolute -left-16 top-10 h-56 w-56 rounded-full blur-2xl ${blobA}`} />
      <div className={`wm-float-slow absolute right-[-3rem] top-24 h-64 w-64 rounded-full blur-2xl ${blobB}`} />
      <div className={`wm-float absolute bottom-8 left-1/3 h-40 w-40 rounded-full blur-2xl ${blobA}`} />
    </div>
  );
}
