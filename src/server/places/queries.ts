"use cache";

// Read-only places data layer (ROADMAP T3). Returns PUBLISHED content only (AGENTS.md §8).
//
// Everything here is cached (`'use cache'`) so pages can be prerendered and served statically; the cache is
// invalidated on demand through the tags in ./cache-tags.ts (T12) and refreshes at least hourly as a fallback.
// A "use cache" module may only export async functions — shared helpers live in ./internal.ts.
import { cacheLife, cacheTag } from "next/cache";
import { isLocale } from "@/lib/i18n/config";
import { PLACES_TAG, placeTag } from "./cache-tags";
import {
  getDbOrNull,
  isPubliclyVisible,
  placeTranslationInclude,
  publishedWhere,
  toDetail,
  toSummary,
} from "./internal";
import type { PlaceDetailDTO, PlaceSummaryDTO } from "./types";

/** All published places in `locale`, sorted by title. Unknown locale or no database => `[]`. */
export async function getPublishedPlaces(locale: string): Promise<PlaceSummaryDTO[]> {
  cacheLife("hours");
  cacheTag(PLACES_TAG);

  if (!isLocale(locale)) return [];
  const db = getDbOrNull();
  if (!db) return [];

  const rows = await db.placeTranslation.findMany({
    where: publishedWhere(locale),
    include: placeTranslationInclude,
    orderBy: { title: "asc" },
  });

  return rows.filter(isPubliclyVisible).map((row) => toSummary(row, locale));
}

/**
 * One published place in `locale`, or `null` (=> the page should call `notFound()`).
 * There is deliberately no silent language fallback: a missing translation is a 404, not text in another language.
 */
export async function getPlaceBySlug(slug: string, locale: string): Promise<PlaceDetailDTO | null> {
  cacheLife("hours");
  cacheTag(PLACES_TAG, placeTag(slug));

  if (!isLocale(locale)) return null;
  const db = getDbOrNull();
  if (!db) return null;

  const row = await db.placeTranslation.findFirst({
    where: { ...publishedWhere(locale), place: { slug, sources: { some: {} } } },
    include: placeTranslationInclude,
  });

  if (!row || !isPubliclyVisible(row)) return null;
  return toDetail(row, locale);
}
