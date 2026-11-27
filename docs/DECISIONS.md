# Architecture Decision Records

Short ADRs. Format: **Context → Decision → Consequences**. Status: `accepted` · `superseded by ADR-x` · `proposed`.
Add new ADRs at the bottom; never rewrite an accepted one — supersede it.

---

## ADR-001 — Next.js 16 App Router on Vercel
- **Status:** accepted (2026-11-27)
- **Context:** We need SSR/SSG pages, API routes and an admin in one codebase, deployed cheaply.
- **Decision:** Next.js 16 (App Router, TypeScript strict, `src/` dir, Tailwind v4, ESLint), hosted on Vercel.
- **Consequences:** One repo, one deploy. Vercel is Next.js' native host, so preview deploys, ISR and Blob need no extra infra.
  Next 16 conventions apply (`proxy.ts` instead of `middleware.ts`, async request APIs).

## ADR-002 — Neon Postgres + Prisma
- **Status:** accepted (2026-11-27)
- **Context:** Relational data (places, translations, sources, many-to-many citations), serverless runtime.
- **Decision:** Neon serverless Postgres with Prisma ORM; pooled URL for the app, direct URL for migrations.
- **Consequences:** Typed queries and migrations; Neon branches give a free DB per dev/preview. DB connection is deferred to T3.

## ADR-003 — Separate translation table, locale as a string
- **Status:** accepted (2026-11-27)
- **Context:** Today `tr` + `en`; more languages later.
- **Decision:** `Place` holds language-neutral data; `PlaceTranslation (placeId, locale, title, body, status, audioUrl, …)`
  with `@@unique([placeId, locale])`. `locale` is a `String` (BCP-47 code), validated in code against
  `src/lib/i18n/config.ts`, not a Postgres enum.
- **Consequences:** Adding a language = add to config + run translation; no migration. Typos are prevented by app-level validation instead of the DB.

## ADR-004 — Sources are first-class and many-to-many
- **Status:** accepted (2026-11-27)
- **Context:** "Unverified historical information is never published"; one book usually covers many buildings.
- **Decision:** `Source` table (title, author, publisher, year, url, type) linked to `Place` via `PlaceSource`
  (with optional page/locator and note).
- **Consequences:** Sources are reusable and shown on every place page; citations can be precise (page numbers).

## ADR-005 — Verification applies only to canonical text; translations auto-publish
- **Status:** accepted (2026-11-27)
- **Context:** The owner wants to verify the historical content personally but not review every translation.
- **Decision:** Each place has a `canonicalLocale` (default `tr`). The canonical translation follows
  `DRAFT → IN_REVIEW → PUBLISHED` (+ `ARCHIVED`) and can only be published by the admin, server-side, if the place has ≥ 1 source.
  Other locales are produced by AI from the **published** canonical text (`origin = MACHINE_TRANSLATED`), published automatically,
  and always shown with a "Machine-translated" label. `sourceTextHash` records which canonical version was translated, so edits trigger re-translation.
  Unpublishing the canonical text unpublishes its translations.
- **Consequences:** Fast multilingual coverage with one human gate on facts. Risk: translation errors reach visitors —
  mitigated by the visible label and the ability to edit/override a translation in admin (which sets `origin = HUMAN`).

## ADR-006 — Locale routing via `[locale]` segment + `proxy.ts`, no i18n library
- **Status:** accepted (2026-11-27)
- **Context:** Two locales, small UI string set.
- **Decision:** Public pages under `src/app/(site)/[locale]/…`; `src/proxy.ts` redirects locale-less paths using the
  `NEXT_LOCALE` cookie, then `Accept-Language`, then `tr`. UI strings are typed dictionaries in `src/lib/i18n/dictionaries/`.
  `generateStaticParams` + `dynamicParams = false` makes unknown locales 404.
- **Consequences:** No dependency, easy to read. If plurals/ICU formatting become necessary, revisit (e.g. next-intl).

## ADR-007 — Admin is not localized and lives in its own root layout
- **Status:** accepted (2026-11-27)
- **Decision:** `/admin` in route group `src/app/(admin)/` with its own root layout (`<html lang="tr">`), excluded from locale redirects.
- **Consequences:** Less work; public and admin bundles/styles stay separate. Two root layouts means navigating between them is a full page load (acceptable).

## ADR-008 — Language-neutral QR URLs
- **Status:** accepted (2026-11-27)
- **Decision:** QR codes encode `/p/{slug}`, which redirects to `/{locale}/places/{slug}` using the visitor's language.
- **Consequences:** One physical QR per building serves all languages; printed codes never need reprinting when locales are added. Slugs must be stable.

## ADR-009 — TTS generated once, stored in Vercel Blob, keyed by text hash
- **Status:** accepted (2026-11-27)
- **Decision:** A provider-agnostic `TtsProvider` interface. Audio is generated when a translation is published, uploaded to
  Vercel Blob, and `audioUrl` + `audioTextHash` are stored on `PlaceTranslation`. Regenerate only when the text hash changes.
  The provider is chosen in T15 by comparing Turkish voice quality.
- **Consequences:** No per-request TTS cost or latency; audio is CDN-cached and PWA-cacheable. Provider can be swapped later.

## ADR-010 — Admin auth: Auth.js + GitHub OAuth + email allowlist
- **Status:** accepted (2026-11-27)
- **Decision:** Auth.js with the GitHub provider; only emails in `ADMIN_EMAILS` get access. Checked in `proxy.ts` (fast redirect)
  **and** in every admin server action / API route (real security).
- **Consequences:** No passwords to store; single admin today, more admins = add an email.

## ADR-011 — Map: Leaflet + OpenStreetMap; directions via Google Maps URL
- **Status:** accepted (2026-11-27)
- **Decision:** Leaflet with OSM tiles (with attribution) for the in-app map. Each place gets a
  "Get directions in Google Maps" link built with the keyless Maps URL format
  `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`.
- **Consequences:** No API key or billing; visitors still get turn-by-turn navigation in the app they know.
  If traffic grows, OSM's tile usage policy may require a tile provider (revisit then).

## ADR-012 — Multi-agent development with folder ownership and git worktrees
- **Status:** accepted (2026-11-27)
- **Context:** Claude Code, Codex and Antigravity work in parallel on one machine.
- **Decision:** Folder ownership table in `AGENTS.md`; one git worktree + branch per agent; shared files changed minimally;
  Conventional Commits; one PR per task; the owner merges. `.gitattributes` forces LF line endings.
- **Consequences:** Few merge conflicts and clear responsibility; cross-cutting changes need coordination via PR notes.

## ADR-013 — The build must pass without a database; the data layer decides, pages stay simple
- **Status:** accepted (2026-11-27)
- **Context:** CI (T5) runs `npm run build` with no database. Pages that read places are prerendered at build time,
  so a missing `DATABASE_URL` must not crash the build. But on Vercel a missing `DATABASE_URL` is a real misconfiguration
  that must not silently ship an empty site.
- **Decision:**
  1. Public pages read data only through `src/server/places` (`getPublishedPlaces`, `getPlaceBySlug`). Both are `'use cache'`
     functions tagged with `places` / `place:{slug}` and `cacheLife("hours")`, so pages are prerendered statically (SSG) and
     refreshed on demand by T12 via `updateTag` — no per-request database load.
  2. With no `DATABASE_URL` the data layer returns `[]` / `null` and logs one warning — **except when `VERCEL` is set**,
     where it throws and fails the deploy. The decision lives in one place (`getDbOrNull` in `src/server/places/internal.ts`),
     not in every page.
  3. Dynamic pages (`/[locale]/places/[slug]`, T7) must give `generateStaticParams` at least one entry — Cache Components rejects an
     empty array. Pattern: `slugs.length ? slugs : [{ slug: "__placeholder__" }]`; the page calls `notFound()` when
     `getPlaceBySlug` returns `null`. Slugs not known at build time are rendered on first visit and then cached.
  4. The Prisma client is created lazily (`getDb()` in `src/lib/db.ts`), so importing it never needs a database.
- **Alternatives rejected:** rendering every request dynamically (`connection()`) — a database hit and slower first paint for
  every visitor; a fake Postgres in CI — more moving parts, and CI is Codex's area.
- **Why:** content changes rarely, so build/cache-time reads are cheap and fast; and failing loudly on Vercel but not in CI
  keeps both safe: CI checks the code, Vercel protects the live site.
- **Consequences:** A CI build contains an empty site (never deployed). Pages must handle the "no places" case. Publishing
  (T12) must call `updateTag`, otherwise changes appear only after the hourly refresh.

## ADR-014 — Prisma with the Neon driver adapter, DTOs at the boundary, defensive publish checks
- **Status:** accepted (2026-11-27)
- **Context:** Prisma 7's `prisma-client` generator needs a driver adapter; the app runs as short-lived serverless functions.
- **Decision:**
  1. `@prisma/adapter-neon` + `@neondatabase/serverless`, using the **pooled** `DATABASE_URL`. Migrations use `DIRECT_URL`
     (`prisma.config.ts`). One lazily created client per process, kept on `globalThis` (`src/lib/db.ts`).
  2. The data layer returns plain DTOs (`src/server/places/types.ts`: Decimal → number, Date → ISO string); pages never see Prisma models.
  3. Besides `status = PUBLISHED`, the data layer also requires the place to have ≥ 1 source and its canonical translation to be
     published. The admin guard (T12) enforces the same rules on write; this is a second lock on read, so hand-edited data
     cannot expose unverified text (AGENTS.md §8).
  4. No silent language fallback: a missing translation is a 404, never text in another language.
- **Why:** DTOs make cached results serializable and keep the page code independent of the schema; the double check means
  one mistake (UI, admin or manual SQL) is not enough to publish unverified history.
- **Consequences:** Adding a field means touching the schema, DTO and mapper (3 small places). A language fallback, if wanted, is a new decision.
