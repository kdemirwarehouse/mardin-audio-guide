// Public DTO types of the places data layer (ROADMAP T3). Pages (T7+) are written against these types,
// never against Prisma models.
//
// DTOs are plain JSON-friendly objects (Decimal -> number, Date -> ISO string) so they can be cached with
// `'use cache'` and passed to client components such as the map.
import type { Locale } from "@/lib/i18n/config";

// Single source of truth for these enums is prisma/schema.prisma.
export type { PlaceCategory, SourceType } from "@/generated/prisma/enums";
import type { PlaceCategory, SourceType } from "@/generated/prisma/enums";

export type { Locale };

/** A reference backing a place's content. Shown as the "Sources" list on the place page. */
export interface SourceDTO {
  type: SourceType;
  title: string;
  author: string | null;
  publisher: string | null;
  year: number | null;
  url: string | null;
  /** Page or section, e.g. "pp. 112–118". */
  locator: string | null;
  note: string | null;
}

export interface PlaceLocationDTO {
  latitude: number;
  longitude: number;
}

/** What list pages, cards and map markers need. */
export interface PlaceSummaryDTO {
  slug: string;
  /** The locale this text is in (the requested one; there is no silent fallback). */
  locale: Locale;
  title: string;
  summary: string | null;
  /** Localized period text, e.g. "12. yüzyıl" / "12th century". */
  period: string | null;
  category: PlaceCategory;
  coverImageUrl: string | null;
  /** Null when the place has no coordinates yet. Pass to `getDirectionsUrl()` in `src/lib/maps.ts`. */
  location: PlaceLocationDTO | null;
  /** True => the UI must show the "Machine-translated" label (AGENTS.md §8). */
  isMachineTranslated: boolean;
}

export interface PlaceAudioDTO {
  url: string;
  durationMs: number | null;
}

/** Everything the place detail page needs. */
export interface PlaceDetailDTO extends PlaceSummaryDTO {
  /** Markdown. */
  body: string;
  builtYearFrom: number | null;
  builtYearTo: number | null;
  /** Null until TTS audio exists for this translation (T15). */
  audio: PlaceAudioDTO | null;
  /** Always at least one entry: places without sources are never returned. */
  sources: SourceDTO[];
  /** ISO 8601. */
  publishedAt: string;
}
