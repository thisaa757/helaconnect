"use client";

// Post an ad. The customer form is only for a registered customer.
// A registered worker posts a separate ad for the work they offer.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageToggle";
import { AdCard } from "@/components/post/AdCard";
import { controlClass, primaryButtonClass } from "@/components/profile/ui";
import { groupedCategories, isCategoryId } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { adsForDraft } from "@/lib/profile/ads";
import { getProfileDraft, getServerProfileDraft, setProfileDraft, subscribeProfileDraft } from "@/lib/profile/draft";
import { isDistrict } from "@/lib/profile/validate";
import { DISTRICTS } from "@/lib/signup/validate";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE = 1_500_000;

function readPicture(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      reject(new Error("type"));
      return;
    }
    if (file.size > MAX_IMAGE) {
      reject(new Error("size"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:image/")) {
        reject(new Error("type"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("type"));
    reader.readAsDataURL(file);
  });
}

export default function PostPage() {
  const { lang } = useLang();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft, getServerProfileDraft);
  const customer = draft.signedUp && draft.role === "customer";
  const worker = draft.signedUp && draft.role === "worker";
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileKey, setFileKey] = useState(0);

  const ads = adsForDraft(draft);

  async function choosePicture(file: File | undefined) {
    setError("");
    setNotice("");
    if (!file) {
      setImage("");
      return;
    }
    try {
      setImage(await readPicture(file));
    } catch (err) {
      setImage("");
      setFileKey((value) => value + 1);
      setError(err instanceof Error && err.message === "size" ? t("postImageSize", lang) : t("postImageType", lang));
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const text = description.trim();
    if (!text || !isDistrict(district) || !isCategoryId(jobRole) || !image) {
      setError(t("postMissing", lang));
      return;
    }
    const current = getProfileDraft();
    if (!current.signedUp) {
      setError(t("postNeedAccount", lang));
      return;
    }
    const next = {
      id: `ad-${crypto.randomUUID()}`,
      role: current.role,
      description: Array.from(text).slice(0, 500).join(""),
      district,
      image,
      jobRole,
      sample: false,
    };
    try {
      const saved = { ...current, ads: [...current.ads, next] };
      if (JSON.stringify(saved).length > 4_500_000) {
        setError(t("postImageSize", lang));
        return;
      }
      setProfileDraft(saved);
    } catch {
      setError(t("postImageSize", lang));
      return;
    }
    setDescription("");
    setDistrict("");
    setJobRole("");
    setImage("");
    setFileKey((value) => value + 1);
    setError("");
    setNotice(t("postSaved", lang));
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t("postTitle", lang)}</h1>
        <p className="text-stone-700">{t("postIntro", lang)}</p>
      </header>

      {!draft.signedUp ? (
        <section className="card space-y-3">
          <p>{t("postNeedAccount", lang)}</p>
          <Link href="/signup" className={primaryButtonClass}>
            {t("postSignUp", lang)}
          </Link>
        </section>
      ) : null}

      {customer ? (
        <form className="card space-y-3" onSubmit={submit}>
          <p className="text-stone-700">{t("postCustomerOnly", lang)}</p>
          <label className="block space-y-1 font-semibold">
            {t("postWorkNeeded", lang)}
            <textarea
              className={controlClass}
              rows={5}
              maxLength={500}
              value={description}
              placeholder={t("postWorkNeededHint", lang)}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postDistrict", lang)}
            <select className={controlClass} value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">{t("postChooseDistrict", lang)}</option>
              {DISTRICTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postJobRole", lang)}
            <select className={controlClass} value={jobRole} onChange={(event) => setJobRole(event.target.value)}>
              <option value="">{t("postChooseJobRole", lang)}</option>
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
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postPicture", lang)}
            <input
              key={fileKey}
              className={controlClass}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void choosePicture(event.target.files?.[0])}
            />
          </label>
          {image ? <img src={image} alt="" className="h-40 w-full rounded-2xl object-cover" /> : null}
          {error ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p role="status" className="text-sm font-medium text-[#2F3A7A]">
              {notice}
            </p>
          ) : null}
          <button type="submit" className={primaryButtonClass}>
            {t("postSubmit", lang)}
          </button>
        </form>
      ) : null}

      {worker ? (
        <form className="card space-y-3" onSubmit={submit}>
          <p className="text-stone-700">{t("postWorkerOnly", lang)}</p>
          <label className="block space-y-1 font-semibold">
            {t("postWorkOffered", lang)}
            <textarea
              className={controlClass}
              rows={5}
              maxLength={500}
              value={description}
              placeholder={t("postWorkOfferedHint", lang)}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postDistrict", lang)}
            <select className={controlClass} value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">{t("postChooseDistrict", lang)}</option>
              {DISTRICTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postJobRole", lang)}
            <select className={controlClass} value={jobRole} onChange={(event) => setJobRole(event.target.value)}>
              <option value="">{t("postChooseJobRole", lang)}</option>
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
          </label>
          <label className="block space-y-1 font-semibold">
            {t("postPicture", lang)}
            <input
              key={fileKey}
              className={controlClass}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void choosePicture(event.target.files?.[0])}
            />
          </label>
          {image ? <img src={image} alt="" className="h-40 w-full rounded-2xl object-cover" /> : null}
          {error ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p role="status" className="text-sm font-medium text-[#2F3A7A]">
              {notice}
            </p>
          ) : null}
          <button type="submit" className={primaryButtonClass}>
            {t("postSubmit", lang)}
          </button>
        </form>
      ) : null}

      {ads.length > 0 ? (
        <section className="space-y-3" aria-labelledby="posted-ads-heading">
          <h2 id="posted-ads-heading" className="text-xl font-bold">
            {t("postYourAds", lang)}
          </h2>
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} lang={lang} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
