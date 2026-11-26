# PRODUCT.md — Mardin Audio Guide

## One-liner
Scan the QR code on a historic building in Mardin and read or listen to its verified story in your own language.

## Problem
Mardin's old town is full of historic buildings (mosques, churches, madrasas, mansions, caravanserais),
but on-site information is scarce, often Turkish-only, and rarely cites where it comes from.

## Target users
| User | Language | Needs |
|---|---|---|
| **Local residents & domestic tourists** | Turkish (`tr`) | Accurate, sourced history of places they walk past daily; easy listening on the go |
| **International visitors** | English (`en`) | Quick context in English, audio while walking, works with poor mobile data |
| **Admin / content editor** (the project owner) | Turkish | Review AI-researched drafts, check sources, publish |

## Core features (v1)
1. **Place pages** — title, story, period, photos, source list, "Machine-translated" label where applicable.
2. **QR codes** — one language-neutral QR per building (`/p/{slug}`) that opens the visitor's language.
3. **Audio narration** — pre-generated TTS per language, stored once, streamed from Blob.
4. **Map** — all published places on Leaflet + OpenStreetMap, plus a "Get directions in Google Maps" link per place.
5. **Admin panel** — GitHub login (allowlisted email), content and source management, publish workflow.
6. **Content verification** — AI-researched Turkish text arrives as a draft with source links; only the admin publishes it.
7. **Automatic translation** — once canonical text is published, AI translates it to other locales and publishes
   automatically with a visible "Machine-translated" label.
8. **Offline mode (PWA)** — installable; visited places and their audio work without internet. (Later phase.)

## Principles
- **Accuracy over volume.** No source, no publish.
- **Mobile first.** Most use is one-handed, outdoors, on a phone, in sunlight.
- **Fast on bad networks.** Static/cached pages, compressed audio.
- **Open to new languages.** Adding a locale is a config + translation job, not a schema change.

## Out of scope (for now)
- User accounts, comments, ratings or reviews for visitors.
- Native iOS/Android apps (the PWA covers this).
- Ticketing, payments, bookings, commercial listings.
- Live/real-time TTS on each request.
- Languages beyond `tr` and `en` (the data model supports them, the content doesn't yet).
- Indoor navigation, AR, user-generated content.
- Multiple editors with roles (single admin for now).

## Success criteria for launch
- ≥ 10 places published with sources, in both languages, each with audio.
- QR → page loads in < 2 s on a 4G phone; Lighthouse mobile performance & accessibility ≥ 90.
- Zero published places without a source.
