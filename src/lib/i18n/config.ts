// Single source of truth for supported locales (ADR-003, ADR-006).
// To add a language: add its code here, add a dictionary, then run the translation pipeline (T13).

export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

/** Cookie that remembers the visitor's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Native names, used by the language switcher. */
export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}
