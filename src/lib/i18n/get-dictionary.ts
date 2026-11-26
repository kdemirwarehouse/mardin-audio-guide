import type { Locale } from "./config";
import type trDictionary from "./dictionaries/tr";

/** Shape every dictionary must match (keys from the Turkish reference). */
export type Dictionary = typeof trDictionary;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  tr: () => import("./dictionaries/tr").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
