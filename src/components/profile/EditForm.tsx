"use client";

// Editable profile fields. Save only checks the values. It does not call a server.

import { groupedCategories } from "@/lib/categories";
import { controlClass, primaryButtonClass, secondaryButtonClass } from "@/components/profile/ui";
import type { ProfileCopy } from "@/lib/profile/translations";
import type { ProfileErrors, ProfileField, ProfileFormValues } from "@/lib/profile/types";
import { textLength } from "@/lib/profile/validate";
import { DISTRICTS, type Role } from "@/lib/signup/validate";
import type { Lang } from "@/lib/types";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function EditForm({
  role,
  lang,
  values,
  errors,
  formError,
  saving,
  copy,
  onChange,
  onBlur,
  onSubmit,
  onCancel,
}: {
  role: Role;
  lang: Lang;
  values: ProfileFormValues;
  errors: ProfileErrors;
  formError: string;
  saving: boolean;
  copy: ProfileCopy;
  onChange: (field: ProfileField, value: string) => void;
  onBlur: (field: ProfileField) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const worker = role === "worker";
  const descriptionErrorId = errors.description ? "profile-description-error" : undefined;
  const descriptionCountId = "profile-description-count";
  const describedBy = [descriptionCountId, descriptionErrorId].filter(Boolean).join(" ") || undefined;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate aria-busy={saving}>
      <div className="space-y-1">
        <label className="block text-base font-semibold" htmlFor="profile-fullName">
          {copy.ownerName}
        </label>
        <input
          id="profile-fullName"
          className={controlClass}
          value={values.fullName}
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "profile-fullName-error" : undefined}
          onChange={(event) => onChange("fullName", event.target.value)}
          onBlur={() => onBlur("fullName")}
        />
        <FieldError id="profile-fullName-error" message={errors.fullName ? copy.errors[errors.fullName] : undefined} />
      </div>

      {worker ? (
        <>
          <div className="space-y-1">
            <label className="block text-base font-semibold" htmlFor="profile-businessName">
              {copy.businessName}
            </label>
            <input
              id="profile-businessName"
              className={controlClass}
              value={values.businessName}
              autoComplete="organization"
              aria-required="true"
              aria-invalid={Boolean(errors.businessName)}
              aria-describedby={errors.businessName ? "profile-businessName-error" : undefined}
              onChange={(event) => onChange("businessName", event.target.value)}
              onBlur={() => onBlur("businessName")}
            />
            <FieldError id="profile-businessName-error" message={errors.businessName ? copy.errors[errors.businessName] : undefined} />
          </div>

          <div className="space-y-1">
            <label className="block text-base font-semibold" htmlFor="profile-businessType">
              {copy.businessType}
            </label>
            <select
              id="profile-businessType"
              className={controlClass}
              value={values.businessType}
              aria-required="true"
              aria-invalid={Boolean(errors.businessType)}
              aria-describedby={errors.businessType ? "profile-businessType-error" : undefined}
              onChange={(event) => onChange("businessType", event.target.value)}
              onBlur={() => onBlur("businessType")}
            >
              <option value="">{copy.selectBusinessType}</option>
              {groupedCategories().map((group) => (
                <optgroup key={group.id} label={group.labels[lang]}>
                  {group.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.labels[lang]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <FieldError id="profile-businessType-error" message={errors.businessType ? copy.errors[errors.businessType] : undefined} />
          </div>
        </>
      ) : null}

      <div className="space-y-1">
        <label className="block text-base font-semibold" htmlFor="profile-description">
          {copy.description}
        </label>
        <textarea
          id="profile-description"
          className={`${controlClass} min-h-36 py-3`}
          value={values.description}
          placeholder={worker ? copy.workerPlaceholder : copy.customerPlaceholder}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={describedBy}
          onChange={(event) => onChange("description", event.target.value)}
          onBlur={() => onBlur("description")}
        />
        <p id={descriptionCountId} aria-live="polite" className={`text-sm ${textLength(values.description) > 400 ? "font-semibold text-red-700" : "text-stone-600"}`}>
          {textLength(values.description)}/400
        </p>
        <FieldError id="profile-description-error" message={errors.description ? copy.errors[errors.description] : undefined} />
      </div>

      <div className="space-y-1">
        <label className="block text-base font-semibold" htmlFor="profile-district">
          {copy.district}
        </label>
        <select
          id="profile-district"
          className={controlClass}
          value={values.district}
          aria-required="true"
          aria-invalid={Boolean(errors.district)}
          aria-describedby={errors.district ? "profile-district-error" : undefined}
          onChange={(event) => onChange("district", event.target.value)}
          onBlur={() => onBlur("district")}
        >
          <option value="">{copy.selectDistrict}</option>
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {copy.districts[district]}
            </option>
          ))}
        </select>
        <FieldError id="profile-district-error" message={errors.district ? copy.errors[errors.district] : undefined} />
      </div>

      {worker ? (
        <div className="space-y-1">
          <label className="block text-base font-semibold" htmlFor="profile-businessPhone">
            {copy.businessPhone}
          </label>
          <input
            id="profile-businessPhone"
            className={controlClass}
            value={values.businessPhone}
            inputMode="tel"
            autoComplete="tel"
            placeholder="07XXXXXXXX"
            aria-required="true"
            aria-invalid={Boolean(errors.businessPhone)}
            aria-describedby={errors.businessPhone ? "profile-businessPhone-error" : undefined}
            onChange={(event) => onChange("businessPhone", event.target.value)}
            onBlur={() => onBlur("businessPhone")}
          />
          <FieldError id="profile-businessPhone-error" message={errors.businessPhone ? copy.errors[errors.businessPhone] : undefined} />
        </div>
      ) : null}

      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onCancel} disabled={saving}>
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}
