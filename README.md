# Mardin Audio Guide

Bilingual (Turkish / English) audio guide for the historic buildings of Mardin.
Scan a building's QR code, read or listen to its verified story in your language.

- Product: [PRODUCT.md](PRODUCT.md)
- Contributor & agent rules: [AGENTS.md](AGENTS.md)
- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Architecture decisions: [docs/DECISIONS.md](docs/DECISIONS.md)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Database (Neon Postgres + Prisma)

`.env.local` needs two Neon connection strings (never commit them; how to get them: `docs/ROADMAP.md`, task H1):

| Variable | Used by | Neon string |
|---|---|---|
| `DATABASE_URL` | the app at runtime | pooled |
| `DIRECT_URL` | Prisma migrations | direct (non-pooled) |

```bash
npx prisma migrate dev --name <what-changed>   # create + apply a migration on your dev branch (after editing schema.prisma)
npx prisma migrate deploy                      # apply existing migrations only (production / preview, ROADMAP T21)
npx prisma migrate status                      # is the database up to date?
npx prisma generate                            # regenerate the client (also runs on npm install)
npx prisma studio                              # browse the data
npm run db:validate                            # validate schema.prisma
```

- Never run `prisma migrate reset` or drop columns without asking first — it erases data.
- Code reads content only through `src/server/places` (`getPublishedPlaces`, `getPlaceBySlug`); it returns published content only.
- `npm run build` works **without** a database (CI has none): the data layer returns no places and logs a warning.
  On Vercel a missing `DATABASE_URL` fails the build on purpose. See ADR-013 in `docs/DECISIONS.md`.
