import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Picks the best supported locale from an Accept-Language header.
 * Small dependency-free parser: "en-US,en;q=0.9,tr;q=0.8" -> "en".
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        base: tag.toLowerCase().split("-")[0],
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      };
    })
    .filter((entry) => entry.base && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
