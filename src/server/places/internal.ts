// Internal helpers for the places data layer. Not part of the public API (see index.ts).
// Kept outside queries.ts because that file is a `'use cache'` module, which may only export async functions.
import { getDb, isDatabaseConfigured } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { ContentOrigin, ContentStatus } from "@/generated/prisma/enums";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { PlaceDetailDTO, PlaceSummaryDTO, SourceDTO } from "./types";

let warnedNoDatabase = false;

/**
 * Returns the DB client, or `null` when no database is configured (ADR-013).
 * - On Vercel a missing DATABASE_URL is a misconfiguration: throw, so a deploy fails loudly instead of shipping an empty site.
 * - Elsewhere (CI, a fresh clone) return null so `npm run build` still passes without a database.
 */
export function getDbOrNull(): PrismaClient | null {
  if (isDatabaseConfigured()) return getDb();
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set in this Vercel environment. Ask the project owner to connect Neon.");
  }
  if (!warnedNoDatabase) {
    warnedNoDatabase = true;
    console.warn("[places] DATABASE_URL is not set - returning no places (expected for CI builds).");
  }
  return null;
}

// What we load per translation. The `place` part carries what the defensive publish checks need.
export const placeTranslationInclude = {
  place: {
    include: {
      // Only used to verify the canonical translation is published too.
      translations: { where: { status: ContentStatus.PUBLISHED }, select: { locale: true } },
      sources: { include: { source: true }, orderBy: { createdAt: "asc" } },
    },
  },
} satisfies Prisma.PlaceTranslationInclude;

export type PlaceTranslationRow = Prisma.PlaceTranslationGetPayload<{ include: typeof placeTranslationInclude }>;

/**
 * Where-clause shared by list and detail queries. Only content that may be public:
 *  - the translation itself is PUBLISHED, and
 *  - the place has >= 1 source (AGENTS.md §8; the admin guard enforces this too, this is the second lock).
 * The "canonical translation is also published" rule cannot be expressed in SQL (it compares two columns across
 * a relation), so it is checked in `isPubliclyVisible`.
 */
export function publishedWhere(locale: Locale): Prisma.PlaceTranslationWhereInput {
  return {
    locale,
    status: ContentStatus.PUBLISHED,
    place: { sources: { some: {} } },
  };
}

/** A machine translation must disappear when its canonical text is not published (ADR-005). */
export function isPubliclyVisible(row: PlaceTranslationRow): boolean {
  const { canonicalLocale, translations } = row.place;
  return translations.some((t) => t.locale === canonicalLocale);
}

export function toSummary(row: PlaceTranslationRow, locale: Locale): PlaceSummaryDTO {
  const { place } = row;
  return {
    slug: place.slug,
    locale,
    title: row.title,
    summary: row.summary,
    period: row.period,
    category: place.category,
    coverImageUrl: place.coverImageUrl,
    // Prisma returns Decimal objects; DTOs carry plain numbers so they are serializable.
    location:
      place.latitude !== null && place.longitude !== null
        ? { latitude: Number(place.latitude), longitude: Number(place.longitude) }
        : null,
    isMachineTranslated: row.origin === ContentOrigin.MACHINE_TRANSLATED,
  };
}

export function toDetail(row: PlaceTranslationRow, locale: Locale): PlaceDetailDTO {
  const sources: SourceDTO[] = row.place.sources.map((ps) => ({
    type: ps.source.type,
    title: ps.source.title,
    author: ps.source.author,
    publisher: ps.source.publisher,
    year: ps.source.year,
    url: ps.source.url,
    locator: ps.locator,
    note: ps.note,
  }));

  return {
    ...toSummary(row, locale),
    body: row.body,
    builtYearFrom: row.place.builtYearFrom,
    builtYearTo: row.place.builtYearTo,
    audio: row.audioUrl ? { url: row.audioUrl, durationMs: row.audioDurationMs } : null,
    sources,
    publishedAt: (row.publishedAt ?? row.updatedAt).toISOString(),
  };
}
