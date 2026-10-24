"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfileDraft, setProfileDraft } from "@/lib/profile/draft";
import { canonicalPhone } from "@/lib/profile/validate";
import { translations, type SignupCopy } from "@/lib/signup/translations";
import {
  DISTRICTS,
  firstInvalidField,
  validateField,
  validateSignup,
  type Role,
  type SignupErrorCode,
  type SignupErrors,
  type SignupField,
  type SignupValues,
} from "@/lib/signup/validate";

const emptyValues: SignupValues = {
  role: "customer",
  fullName: "",
  email: "",
  phone: "",
  district: "",
  businessName: "",
  businessPhone: "",
  password: "",
  confirmPassword: "",
};

function fieldId(field: SignupField) {
  return `signup-${field}`;
}

export function SignupForm() {
  const router = useRouter();
  const roleLabelId = useId();
  const formErrorId = useId();
  const language = "en" as const;
  const [values, setValues] = useState<SignupValues>(emptyValues);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [samePhone, setSamePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const copy = translations[language];

  function update(field: SignupField, value: string) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "phone" && samePhone) next.businessPhone = value;
      return next;
    });
  }

  function blur(field: SignupField) {
    const code = validateField(field, values);
    setErrors((current) => {
      const next = { ...current };
      if (code) next[field] = code;
      else delete next[field];
      return next;
    });
  }

  function chooseRole(role: Role) {
    setValues((current) => ({ ...current, role }));
    if (role === "customer") {
      setErrors((current) => {
        const next = { ...current };
        delete next.businessName;
        delete next.businessPhone;
        return next;
      });
    }
  }

  function toggleSamePhone(checked: boolean) {
    setSamePhone(checked);
    if (checked) {
      setValues((current) => ({ ...current, businessPhone: current.phone }));
      setErrors((current) => {
        const next = { ...current };
        delete next.businessPhone;
        return next;
      });
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const found = validateSignup(values);
    setErrors(found);
    const first = firstInvalidField(found);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    const worker = values.role === "worker";
    const current = getProfileDraft();
    const phone = canonicalPhone(values.phone) ?? "";
    const businessPhone = worker ? (canonicalPhone(values.businessPhone) ?? "") : "";
    setProfileDraft({
      signedUp: true,
      role: values.role,
      email: values.email.trim(),
      phone,
      values: {
        ...current.values,
        fullName: values.fullName.trim(),
        district: values.district,
        businessName: worker ? values.businessName.trim() : "",
        businessPhone,
      },
      interests: current.interests,
      ads: current.ads,
    });
    router.push("/profile");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F5EDE3] px-4 py-8 text-stone-900">
      <div className="w-full max-w-[440px]">
        <section className="rounded-3xl border border-stone-200 bg-white px-5 py-6 shadow-[0_16px_40px_rgba(47,58,122,0.08)] sm:px-7">
          <div className="mb-5 flex items-center gap-3">
            <img src="/hela-connect-logo.jpg" alt="" className="h-12 w-12 rounded-2xl bg-white object-cover" />
            <p className="text-lg font-bold tracking-tight">Hela-Connect</p>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{copy.title}</h1>
          <p className="mt-2 text-base leading-relaxed text-stone-600">{copy.subtitle}</p>

          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            {formError ? (
              <p id={formErrorId} role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                {formError}
              </p>
            ) : null}

            <fieldset className="space-y-2">
              <legend id={roleLabelId} className="text-sm font-semibold text-stone-800">
                {copy.roleLegend}
              </legend>
              <div className="grid gap-3" role="radiogroup" aria-labelledby={roleLabelId}>
                <RoleCard
                  name="role"
                  value="worker"
                  checked={values.role === "worker"}
                  title={copy.workerTitle}
                  hint={copy.workerHint}
                  onChoose={() => chooseRole("worker")}
                />
                <RoleCard
                  name="role"
                  value="customer"
                  checked={values.role === "customer"}
                  title={copy.customerTitle}
                  hint={copy.customerHint}
                  onChoose={() => chooseRole("customer")}
                />
              </div>
            </fieldset>

            <TextField
              id={fieldId("fullName")}
              label={copy.fullName}
              type="text"
              value={values.fullName}
              placeholder={copy.fullNamePlaceholder}
              autoComplete="name"
              error={message(copy, errors.fullName)}
              onChange={(value) => update("fullName", value)}
              onBlur={() => blur("fullName")}
            />
            <TextField
              id={fieldId("email")}
              label={copy.email}
              type="email"
              value={values.email}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              inputMode="email"
              error={message(copy, errors.email)}
              onChange={(value) => update("email", value)}
              onBlur={() => blur("email")}
            />
            <TextField
              id={fieldId("phone")}
              label={copy.phone}
              type="tel"
              value={values.phone}
              placeholder={copy.phonePlaceholder}
              autoComplete="tel"
              inputMode="tel"
              describedBy="signup-privacy"
              error={message(copy, errors.phone)}
              onChange={(value) => update("phone", value)}
              onBlur={() => blur("phone")}
            />

            <div>
              <label htmlFor={fieldId("district")} className="mb-1.5 block text-sm font-semibold text-stone-800">
                {copy.district}
              </label>
              <select
                id={fieldId("district")}
                name="district"
                value={values.district}
                aria-invalid={errors.district ? true : undefined}
                aria-describedby={errors.district ? `${fieldId("district")}-error` : undefined}
                onChange={(event) => update("district", event.target.value)}
                onBlur={() => blur("district")}
                className={inputClass(Boolean(errors.district))}
              >
                <option value="">{copy.districtPlaceholder}</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district ? (
                <p id={`${fieldId("district")}-error`} className="mt-1 text-sm font-medium text-red-700">
                  {copy.errors.district}
                </p>
              ) : null}
            </div>

            {values.role === "worker" ? (
              <>
                <TextField
                  id={fieldId("businessName")}
                  label={copy.businessName}
                  type="text"
                  value={values.businessName}
                  placeholder={copy.businessNamePlaceholder}
                  autoComplete="organization"
                  error={message(copy, errors.businessName)}
                  onChange={(value) => update("businessName", value)}
                  onBlur={() => blur("businessName")}
                />
                <TextField
                  id={fieldId("businessPhone")}
                  label={copy.businessPhone}
                  type="tel"
                  value={values.businessPhone}
                  placeholder={copy.businessPhonePlaceholder}
                  autoComplete="tel"
                  inputMode="tel"
                  readOnly={samePhone}
                  describedBy="signup-privacy"
                  error={message(copy, errors.businessPhone)}
                  onChange={(value) => update("businessPhone", value)}
                  onBlur={() => blur("businessPhone")}
                />
                <label className="flex min-h-12 items-center gap-3 text-sm font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={samePhone}
                    onChange={(event) => toggleSamePhone(event.target.checked)}
                    className="h-5 w-5 accent-[#2F3A7A]"
                  />
                  {copy.samePhone}
                </label>
              </>
            ) : null}

            <p id="signup-privacy" className="text-sm leading-relaxed text-stone-600">
              {copy.privacy}
            </p>

            <PasswordField
              id={fieldId("password")}
              label={copy.password}
              value={values.password}
              placeholder={copy.passwordPlaceholder}
              autoComplete="new-password"
              shown={showPassword}
              showLabel={copy.showPassword}
              hideLabel={copy.hidePassword}
              error={message(copy, errors.password)}
              onChange={(value) => update("password", value)}
              onBlur={() => blur("password")}
              onToggle={() => setShowPassword((current) => !current)}
            />
            <PasswordField
              id={fieldId("confirmPassword")}
              label={copy.confirmPassword}
              value={values.confirmPassword}
              placeholder={copy.confirmPlaceholder}
              autoComplete="new-password"
              shown={showConfirm}
              showLabel={copy.showPassword}
              hideLabel={copy.hidePassword}
              error={message(copy, errors.confirmPassword)}
              onChange={(value) => update("confirmPassword", value)}
              onBlur={() => blur("confirmPassword")}
              onToggle={() => setShowConfirm((current) => !current)}
            />

            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2F3A7A] px-4 text-base font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3A7A] focus-visible:ring-offset-2 hover:bg-[#24306a]"
            >
              {copy.submit}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-stone-600">
            {copy.haveAccount}{" "}
            <Link href="/login" className="font-semibold text-[#2F3A7A] underline-offset-4 hover:underline">
              {copy.logIn}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function message(copy: SignupCopy, code: SignupErrorCode | undefined) {
  return code ? copy.errors[code] : undefined;
}

function inputClass(invalid: boolean) {
  return `min-h-12 w-full rounded-xl border bg-white px-3 text-base text-stone-900 outline-none focus-visible:ring-2 focus-visible:ring-[#2F3A7A] ${
    invalid ? "border-red-700" : "border-stone-300"
  }`;
}

function TextField({
  id,
  label,
  type,
  value,
  placeholder,
  autoComplete,
  inputMode,
  readOnly,
  describedBy,
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: "email" | "tel";
  readOnly?: boolean;
  describedBy?: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;
  const described = [describedBy, error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`${inputClass(Boolean(error))} ${readOnly ? "bg-stone-50" : ""}`}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  shown,
  showLabel,
  hideLabel,
  error,
  onChange,
  onBlur,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  shown: boolean;
  showLabel: string;
  hideLabel: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onToggle: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`${inputClass(Boolean(error))} pr-14`}
        />
        <button
          type="button"
          aria-label={shown ? hideLabel : showLabel}
          aria-pressed={shown}
          onClick={onToggle}
          className="absolute inset-y-1 right-1 grid w-12 place-items-center rounded-lg text-[#2F3A7A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3A7A]"
        >
          {shown ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RoleCard({
  name,
  value,
  checked,
  title,
  hint,
  onChoose,
}: {
  name: string;
  value: Role;
  checked: boolean;
  title: string;
  hint: string;
  onChoose: () => void;
}) {
  return (
    <label
      className={`block min-h-12 cursor-pointer rounded-2xl border-2 px-4 py-3 focus-within:ring-2 focus-within:ring-[#2F3A7A] focus-within:ring-offset-2 ${
        checked ? "border-[#2F3A7A] bg-[#2F3A7A]/5" : "border-stone-200 bg-white"
      }`}
    >
      <input className="sr-only" type="radio" name={name} value={value} checked={checked} onChange={onChoose} />
      <span className="block text-base font-bold">{title}</span>
      <span className="mt-0.5 block text-sm text-stone-600">{hint}</span>
    </label>
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

