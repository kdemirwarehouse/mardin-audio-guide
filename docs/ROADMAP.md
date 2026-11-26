# ROADMAP — Mardin Audio Guide

Owners: **CC** = Claude Code · **CX** = Codex · **AG** = Antigravity.
"Parallel with" lists tasks that can run at the same time without blocking each other.
Status: `todo` · `doing` · `review` · `done`. Owners update only their own rows.

Every task's acceptance criterion implicitly includes the Definition of Done in `AGENTS.md` §7.

---

## Phase 0 — Bootstrap (direct pushes to `main` allowed)

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T0 | Repo + Next.js skeleton, `.env.example`, GitHub repo | CC | — | — | App builds; repo public on GitHub | done |
| T1 | Agent contract: `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, ROADMAP, ADRs | CC | T0 | — | Files merged on `main` | done |
| T2 | Prisma schema draft (Place, PlaceTranslation, Source, PlaceSource); `/tr` `/en` routing skeleton; empty home | CC | T1 | — | `prisma validate` passes; `/` redirects to `/tr` or `/en`; `/xx` is 404 | done |

## Phase 1 — Foundations (from here on: branch + PR only)

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T3 | Neon dev DB connection, first migration, Prisma client singleton, read-only data layer (`getPublishedPlaces`, `getPlaceBySlug(locale)`) with typed DTOs | CC | T2 | T4, T5 | Migration applies on a Neon dev branch; data layer returns only `PUBLISHED` content; DTO types exported from `src/server/places/types.ts` | todo |
| T4 | `DESIGN.md` (colours, type, spacing, Mardin-stone palette, dark mode, a11y contrast) + Tailwind tokens + base components (Button, Card, Badge incl. "Machine-translated", Layout shell, language switcher) | AG | T2 | T3, T5 | Components render on a `/[locale]/_styleguide` page; contrast AA | todo |
| T5 | CI on GitHub Actions (install, lint, typecheck, test, build on every PR); Vitest setup with one sample test; real `npm run test` | CX | T2 | T3, T4 | CI runs and is green on a PR; branch protection recommendation documented in PR | todo |

## Phase 2 — Public experience

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T6 | Content import: JSON format for drafts in `data/places/*.json` (TR text + sources), idempotent `npm run import` script, dev seed with obvious placeholder content | CX | T3 | T7, T8, T9 | Running import twice creates no duplicates; imported content is always `DRAFT`; script refuses rows without a source URL/title | todo |
| T7 | Home (list of places) + place detail page: text, period, sources list, "Machine-translated" badge, Google Maps directions link | AG | T3 (DTOs), T4 | T6, T8, T9 | Pages render from the data layer in both locales; unpublished slugs → 404; SSG/ISR | todo |
| T8 | Map page: Leaflet + OSM, markers for published places, popup links to place pages; client-only, lazy-loaded | AG | T4 | T6, T7, T9 | Map works on mobile; no API key; attribution shown | todo |
| T9 | Language-neutral QR route `/p/[slug]` → redirect to `/{locale}/places/{slug}` via cookie / `Accept-Language`; `getDirectionsUrl()` helper; sitemap + `hreflang` metadata | CC | T3 | T6, T7, T8 | `/p/x` redirects correctly for tr/en headers; unknown slug → 404 | todo |
| T10 | QR generator: admin-only page + CLI script producing print-ready SVG/PNG (with place name + short URL) for one or all places | CX | T9 | T11, T12 | Generated QR scans to `/p/{slug}` on a phone; SVG prints at 5×5 cm | todo |

## Phase 3 — Admin & content workflow

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T11 | Auth.js with GitHub OAuth, `ADMIN_EMAILS` allowlist, `/admin` protected in proxy + server checks; admin shell layout | CC | T3 | T10, T7, T8 | Non-allowlisted GitHub user gets 403; all `/api/admin/*` routes check session server-side | todo |
| T12 | Admin CRUD for places, canonical (TR) text and sources; review screen showing draft + its source links side by side; publish/unpublish with server-side guard (≥ 1 source) | CC | T11 | T10, T14 | Publishing a place with 0 sources fails at the API level; every status change is timestamped | todo |
| T13 | Machine translation pipeline: on canonical publish (or edit), translate to all other locales via provider-agnostic `Translator` interface, auto-publish with `origin = MACHINE_TRANSLATED`; re-translate when canonical text hash changes | CC | T12 | T14, T16 | Publishing TR creates/updates EN within one request/job; EN never published while TR is unpublished; stale detection via `sourceTextHash` | todo |
| T14 | Tests for the publish guard, status transitions and translation trigger (unit + API) | CX | T12 | T13 | Tests cover: no-source publish rejected, unpublish cascades to translations, non-admin rejected | todo |

## Phase 4 — Audio

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T15 | TTS pipeline: provider-agnostic `TtsProvider` interface; compare ≥ 2 providers on Turkish quality (ADR); generate MP3 once per published translation, upload to Vercel Blob, store `audioUrl` + `audioTextHash`; regenerate only when text changes; admin "regenerate audio" button | CC | T13 | T16 | Re-publishing unchanged text makes zero TTS calls; audio plays from Blob URL | todo |
| T16 | Audio player component (play/pause, scrub, speed, remembers position, accessible) on place page | AG | T7 | T15 | Works with a static sample MP3; keyboard + screen-reader usable | todo |

## Phase 5 — Offline / PWA

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T17 | Web app manifest, icons, install prompt UI, offline fallback page design | AG | T7 | T18 | Lighthouse "installable" passes | todo |
| T18 | Service worker: cache visited place pages + their audio; "save for offline" for a walking route | CC | T15, T17 | T19 | A visited place + audio opens in airplane mode | todo |

## Phase 6 — Quality

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T19 | Playwright e2e: QR redirect → place page → audio plays; admin publish flow (mocked auth); runs in CI | CX | T12, T15 | T18, T20 | e2e suite green in CI | todo |
| T20 | Accessibility + performance pass (Lighthouse mobile ≥ 90, images optimised, fonts) | AG | T7, T16 | T19 | Report attached to PR | todo |

## Phase 7 — Launch on Vercel

| ID | Task | Owner | Depends on | Parallel with | Acceptance criterion | Status |
|---|---|---|---|---|---|---|
| T21 | Production setup: Vercel project linked to GitHub, Neon prod branch + Vercel integration, Blob store, env vars, GitHub OAuth app for prod URL, preview deployments per PR, `prisma migrate deploy` in build | CC | T19, T20 | — | Production URL live; preview deploy on every PR; no secrets in repo | todo |
| T22 | Launch content: ≥ 10 places verified & published with audio; print QR sheet; smoke test on real phones in Mardin | CC + CX + owner | T21 | — | PRODUCT.md success criteria met | todo |

## Later (post-launch)

| ID | Task | Owner | Depends on | Notes |
|---|---|---|---|---|
| T23 | Telegram bot: send a place name / location, get the story + audio | CX | T21 | Uses the public data layer, no new write paths |
| T24 | Additional locales (e.g. `ar`, `ku`, `de`) | CC | T13 | Config + translation run; check RTL for `ar` (AG) |
| T25 | AI research assistant in admin: generate a TR draft + candidate sources for a place | CC | T12 | Output is always `DRAFT` |

---

## Suggested first parallel batch (day 2)
- **CC:** T3 (DB + data layer) — unblocks most of Phase 2.
- **AG:** T4 (design system) — needs only the T2 skeleton.
- **CX:** T5 (CI + Vitest) — needs only the T2 skeleton.
