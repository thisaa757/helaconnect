"use client";

// Own profile and the public profile. Details are checked in the browser and are not saved.

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { AdCard } from "@/components/post/AdCard";
import { DetailsCard, type DetailRow } from "@/components/profile/DetailsCard";
import { EditForm } from "@/components/profile/EditForm";
import { InterestChips } from "@/components/profile/InterestChips";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QrCard } from "@/components/profile/QrCard";
import { ReviewList } from "@/components/profile/ReviewList";
import { primaryButtonClass, secondaryButtonClass } from "@/components/profile/ui";
import { useUnsavedWarning } from "@/components/profile/useUnsavedWarning";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { adsForDraft } from "@/lib/profile/ads";
import { getProfileDraft, getServerProfileDraft, setProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { profileTranslations } from "@/lib/profile/translations";
import type { ProfileErrors, ProfileField, ProfileFormValues } from "@/lib/profile/types";
import {
  canonicalPhone,
  firstInvalidField,
  formatPhone,
  isDistrict,
  isProfileDirty,
  telHref,
  validateProfile,
  whatsAppHref,
} from "@/lib/profile/validate";

function checkedValues(values: ProfileFormValues, role: "worker" | "customer"): ProfileFormValues {
  const next = {
    ...values,
    fullName: values.fullName.trim(),
    description: values.description.trim(),
  };
  if (role === "worker") {
    next.businessName = values.businessName.trim();
    next.businessPhone = canonicalPhone(values.businessPhone) ?? "";
  }
  return next;
}

export function ProfileScreen({ mode, userId }: { mode: "own" | "public"; userId?: string }) {
  const { lang } = useLang();
  const copy = profileTranslations[lang];
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<ProfileFormValues>(draft.values);
  const [baseline, setBaseline] = useState<ProfileFormValues>(draft.values);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const role = draft.role;
  const dirty = editing && isProfileDirty(baseline, values, role);
  useUnsavedWarning(dirty, copy.unsaved);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function update(field: ProfileField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function blur(field: ProfileField) {
    const code = validateProfile(values, role)[field];
    setErrors((current) => {
      const next = { ...current };
      if (code) next[field] = code;
      else delete next[field];
      return next;
    });
  }

  function startEdit() {
    setBaseline(draft.values);
    setValues(draft.values);
    setFormError("");
    setErrors({});
    setEditing(true);
    window.setTimeout(() => document.getElementById("profile-fullName")?.focus(), 0);
  }

  function cancelEdit() {
    if (dirty && !window.confirm(copy.cancelConfirm)) return;
    setValues(draft.values);
    setEditing(false);
    setErrors({});
    setFormError("");
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const found = validateProfile(values, role);
    setErrors(found);
    const first = firstInvalidField(found, role);
    if (first) {
      document.getElementById(`profile-${first}`)?.focus();
      return;
    }
    const next = checkedValues(values, role);
    setProfileDraft({ ...draft, values: next });
    setValues(next);
    setBaseline(next);
    setEditing(false);
    setToast(copy.saved);
  }

  const own = mode === "own";
  const worker = role === "worker";
  const saved = draft.values;
  const districtLabel = isDistrict(saved.district) ? copy.districts[saved.district] : copy.notAdded;
  const displayName = saved.fullName.trim() || copy.notAdded;
  const rows: DetailRow[] = worker
    ? [
        { label: copy.businessName, value: saved.businessName.trim() || copy.notAdded },
        { label: copy.businessType, value: saved.businessType ? categoryLabel(saved.businessType, lang) : copy.notAdded },
        { label: copy.description, value: saved.description.trim() || copy.noDescription },
        { label: copy.businessPhone, value: saved.businessPhone ? formatPhone(saved.businessPhone) : copy.notAdded },
      ]
    : [
        { label: copy.description, value: saved.description.trim() || copy.noDescription },
        { label: copy.district, value: districtLabel },
      ];

  const wa = saved.businessPhone ? whatsAppHref(saved.businessPhone) : null;
  const tel = saved.businessPhone ? telHref(saved.businessPhone) : null;
  const showContact = !own && worker && wa && tel;
  const profileAds = adsForDraft(draft);
  const orderedInterests = [...draft.interests].sort(
    (a, b) => CATEGORIES.findIndex((item) => item.id === a) - CATEGORIES.findIndex((item) => item.id === b),
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <ProfileHeader
        name={displayName}
        role={role}
        districtLabel={districtLabel}
        stats={{ avg: null, count: 0 }}
        ratingsError={false}
        email={own ? draft.email || null : null}
        phone={own && draft.phone ? formatPhone(draft.phone) : null}
        phoneLabel={t("phone", lang)}
        copy={copy}
      />

      <DetailsCard
        title={copy.details}
        rows={rows}
        editing={own && editing}
        canEdit={own}
        editLabel={copy.edit}
        onEdit={startEdit}
        contact={
          showContact ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <a className={primaryButtonClass} href={wa} target="_blank" rel="noopener noreferrer">
                {copy.chatWhatsApp}
              </a>
              <a className={secondaryButtonClass} href={tel}>
                {copy.call}
              </a>
            </div>
          ) : null
        }
      >
        <EditForm
          role={role}
          lang={lang}
          values={values}
          errors={errors}
          formError={formError}
          saving={false}
          copy={copy}
          onChange={update}
          onBlur={blur}
          onSubmit={save}
          onCancel={cancelEdit}
        />
      </DetailsCard>

      {!own ? (
        <p className="px-1 text-sm text-stone-600" role="note">
          {copy.unverified}{" "}
          <Link href={`/report?profile=${userId ?? "profile"}`} className="font-semibold text-[#2F3A7A] underline">
            {copy.report}
          </Link>
        </p>
      ) : null}

      <InterestChips ids={orderedInterests} error={false} canEdit={own} copy={copy} lang={lang} />

      {!own && worker ? <QrCard profileId={userId ?? "profile"} copy={copy} /> : null}

      <ReviewList reviews={[]} error={false} copy={copy} lang={lang} />

      {profileAds.length > 0 ? (
        <section className="space-y-3" aria-labelledby="profile-ads-heading">
          <h2 id="profile-ads-heading" className="text-xl font-bold">
            {t("profileAds", lang)}
          </h2>
          {profileAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} lang={lang} />
          ))}
        </section>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-[#2F3A7A] px-4 py-3 text-center font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
