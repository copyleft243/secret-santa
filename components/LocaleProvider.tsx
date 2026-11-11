"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_LOCALE, messages } from "@/lib/messages";
import type { Locale, Messages } from "@/lib/messages";

const STORAGE_KEY = "secret-santa-locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  msg: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  // Restore the saved preference after mount (French is the default).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") {
      setLocale(stored);
    }
  }, []);

  // Persist the choice and keep <html lang> in sync.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, msg: messages[locale] }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a LocaleProvider");
  }
  return ctx;
}
