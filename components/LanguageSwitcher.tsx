"use client";

import { LOCALES } from "@/lib/messages";
import { useI18n } from "@/components/LocaleProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="fixed right-3 top-3 z-50 flex overflow-hidden rounded-lg border border-stone-300 text-xs font-semibold shadow-sm">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={
            locale === l
              ? "bg-stone-900 px-2.5 py-1.5 text-white"
              : "bg-white px-2.5 py-1.5 text-stone-500 hover:bg-stone-100"
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
