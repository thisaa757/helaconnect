"use client";

// First screen: welcome, then a demo login or signup form.
// Nothing here creates a real session. A valid form only opens Home.

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageToggle, useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";

type View = "welcome" | "login" | "signup";
type Role = "worker" | "customer" | "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthGate({ initialView = "welcome" }: { initialView?: View }) {
  const { lang } = useLang();
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [view, setView] = useState<View>(initialView);
  const [role, setRole] = useState<Role>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  function open(next: View) {
    setErrors({});
    setView(next);
  }

  function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!EMAIL.test(email.trim())) next.email = t("errEmail", lang);
    if (password.length < 8) next.password = t("errPassword", lang);
    setErrors(next);
    if (Object.keys(next).length === 0) router.push("/home");
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
    <div className="relative min-h-dvh overflow-hidden bg-[#FAF7F0] text-[#0F172A]">
      <Background />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
        <div className="mb-6 flex justify-center">
          <LanguageToggle tone="light" />
        </div>

        {view === "welcome" ? (
          <Welcome headingRef={headingRef} onLogin={() => open("login")} onSignup={() => open("signup")} />
        ) : (
          <section className="wm-panel rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-7">
            <button type="button" onClick={() => open("welcome")} className="mb-4 text-base font-semibold text-[#0F766E] underline-offset-4 hover:underline">
              ← {t("authBack", lang)}
            </button>
            <p className="mb-4 rounded-xl bg-[#F59E0B]/15 px-3 py-2 text-sm font-medium text-[#0F172A]">{t("demoAuth", lang)}</p>
            <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold outline-none">
              {view === "login" ? t("logIn", lang) : t("createAccount", lang)}
            </h1>

            {view === "login" ? (
              <form className="mt-5 space-y-4" onSubmit={submitLogin} noValidate>
                <Field id="login-email" label={t("email", lang)} type="email" value={email} autoComplete="email" error={errors.email} onChange={setEmail} />
                <PasswordField id="login-password" label={t("password", lang)} value={password} shown={showPassword} error={errors.password} onChange={setPassword} onToggle={() => setShowPassword((v) => !v)} />
                <button type="submit" className="wm-btn mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-5 text-lg font-bold text-white hover:bg-[#115E59]">
                  {t("logIn", lang)}
                  <Arrow />
                </button>
                <button type="button" className="min-h-11 w-full text-base font-semibold text-[#0F766E]" onClick={() => open("signup")}>
                  {t("switchToSignup", lang)}
                </button>
              </form>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={submitSignup} noValidate>
                <Field id="signup-name" label={t("name", lang)} type="text" value={name} autoComplete="name" error={errors.name} onChange={setName} />
                <Field id="signup-email" label={t("email", lang)} type="email" value={email} autoComplete="email" error={errors.email} onChange={setEmail} />
                <PasswordField id="signup-password" label={t("password", lang)} value={password} shown={showPassword} error={errors.password} onChange={setPassword} onToggle={() => setShowPassword((v) => !v)} />
                <PasswordField id="signup-confirm" label={t("confirmPassword", lang)} value={confirm} shown={showPassword} error={errors.confirm} onChange={setConfirm} onToggle={() => setShowPassword((v) => !v)} />
                <fieldset className="space-y-2">
                  <legend className="text-base font-semibold">{t("roleLabel", lang)}</legend>
                  <RoleChoice role={role} onRole={setRole} compact />
                  {errors.role ? <p className="text-sm font-medium text-red-700">{errors.role}</p> : null}
                </fieldset>
                <button type="submit" className="wm-btn mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-5 text-lg font-bold text-white hover:bg-[#115E59]">
                  {t("createAccount", lang)}
                  <Arrow />
                </button>
                <button type="button" className="min-h-11 w-full text-base font-semibold text-[#0F766E]" onClick={() => open("login")}>
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
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0F766E] text-white shadow-md">
          <ToolMark />
        </span>
        <span className="text-2xl font-bold tracking-tight">WedaMate LK</span>
      </div>
      <div className="wm-copy">
        <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-bold leading-tight outline-none">
          {t("welcomeHeadline", lang)}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-[#64748B]">{t("welcomeBody", lang)}</p>
      </div>
      <div className="wm-actions mt-6 grid gap-3">
        <button type="button" onClick={onLogin} className="wm-btn flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#0F766E] px-5 text-lg font-bold text-white hover:bg-[#115E59]">
          {t("logIn", lang)}
          <Arrow />
        </button>
        <button type="button" onClick={onSignup} className="wm-btn flex min-h-14 items-center justify-center rounded-2xl bg-[#F59E0B] px-5 text-lg font-bold text-[#0F172A] hover:bg-[#D97706]">
          {t("createAccount", lang)}
        </button>
      </div>
      <p className="wm-trust mt-6 text-center text-sm font-semibold tracking-wide text-[#64748B]">
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
            className={`wm-card rounded-2xl border bg-white p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] ${
              selected ? "border-[#0F766E] shadow-sm" : "border-[#E2E8F0]"
            }`}
          >
            <span className="block text-lg font-bold">{option.title}</span>
            {compact ? null : <span className="mt-1 block text-base text-[#64748B]">{option.hint}</span>}
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
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete: string;
}) {
  return (
    <label className="block space-y-1 text-base font-semibold" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-h-12 rounded-xl border border-[#E2E8F0] bg-white px-3 text-base font-normal text-[#0F172A] outline-none focus:border-[#0F766E]"
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
}: {
  id: string;
  label: string;
  value: string;
  shown: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  const { lang } = useLang();
  return (
    <div className="space-y-1">
      <label className="block text-base font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-h-12 rounded-xl border border-[#E2E8F0] bg-white px-3 text-base font-normal outline-none focus:border-[#0F766E]"
        />
        <button type="button" onClick={onToggle} className="min-h-12 shrink-0 rounded-xl border border-[#E2E8F0] px-3 text-sm font-semibold text-[#0F766E]">
          {shown ? t("hidePassword", lang) : t("showPassword", lang)}
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

function Arrow() {
  return (
    <span className="wm-arrow" aria-hidden="true">
      →
    </span>
  );
}

function ToolMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.2 3.4a5 5 0 0 0-6.5 6.3L3.2 14.2a1.8 1.8 0 0 0 2.6 2.6l4.5-4.5a5 5 0 0 0 6.3-6.5L14.2 8.2 11.8 5.8l2.4-2.4zM19 13.2l-2.2 2.2 1.4 1.4-2.2 2.2 1.6 1.6 2.2-2.2 1.4 1.4 2.2-2.2-4.4-4.4z"
      />
    </svg>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="wm-float absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#0F766E]/15 blur-2xl" />
      <div className="wm-float-slow absolute right-[-3rem] top-24 h-64 w-64 rounded-full bg-[#F59E0B]/20 blur-2xl" />
      <div className="wm-float absolute bottom-8 left-1/3 h-40 w-40 rounded-full bg-[#0F766E]/10 blur-2xl" />
    </div>
  );
}
