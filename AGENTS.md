# AGENTS.md — Mardin Audio Guide

Contract for every AI agent (Claude Code, Codex, Antigravity) and human working in this repo.
Read this file fully before starting a task. If something here conflicts with a task prompt, stop and ask.

## 1. Purpose

A bilingual (Turkish + English) audio guide web app for the historic buildings of Mardin.
A visitor scans a building's QR code and reads or listens to its story in their language.
See `PRODUCT.md` for scope, `docs/ROADMAP.md` for tasks, `docs/DECISIONS.md` for architecture decisions (ADRs).

## 2. Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, `src/` dir), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (tokens defined in `DESIGN.md` / `src/app/globals.css`) |
| Database | Neon Postgres via Prisma ORM (`prisma/schema.prisma`) |
| Files | Vercel Blob (TTS audio, images) |
| Auth | Auth.js with GitHub OAuth + email allowlist (admin only) |
| Map | Leaflet + OpenStreetMap tiles (no API key) |
| Hosting | Vercel |
| Package manager | **npm only** (do not add yarn/pnpm/bun lockfiles) |

Locales: `tr` (default) and `en`. Locale list lives in one place: `src/lib/i18n/config.ts`.

## 3. Commands

```bash
npm install          # install deps
npm run dev          # local dev server on http://localhost:3000
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # unit tests (placeholder until ROADMAP T5)
npm run build        # production build
npx prisma validate  # validate the Prisma schema
```

## 4. Folder ownership

Each agent edits **only** the paths it owns. Need a change elsewhere? Open an issue or note it in your PR
description and let the owner do it. Owners may hand over a path by updating this table in a PR.

| Owner | Paths |
|---|---|
| **Claude Code** | `prisma/schema.prisma`, `prisma/migrations/`, `prisma.config.ts`, `src/app/api/`, `src/app/(admin)/`, `src/server/`, `src/lib/` (db, auth, i18n config, tts, translation, maps), `src/proxy.ts`, `next.config.ts`, `vercel.json`, `docs/DECISIONS.md`, `CLAUDE.md` |
| **Codex** | `scripts/`, `prisma/seed/`, `data/` (content import files), `src/features/qr/`, `tests/`, `e2e/`, `.github/`, test configs (`vitest.config.*`, `playwright.config.*`) |
| **Antigravity** | `DESIGN.md`, `src/components/`, `src/app/(site)/` pages and layouts (except the locale guard in `src/app/(site)/[locale]/layout.tsx`, which is shared), `src/features/map/`, `src/features/audio-player/`, `src/app/globals.css`, `public/` |
| **Shared** (state the change in the PR description, keep it minimal) | `package.json`, `package-lock.json`, `AGENTS.md`, `PRODUCT.md`, `docs/ROADMAP.md`, `README.md`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `.gitattributes`, `.env.example` |

Rules for shared files:
- Dependency changes go in their own commit (`build(deps): add leaflet`). Before opening a PR, rebase on `main`;
  if `package-lock.json` conflicts, take `main`'s version and re-run `npm install` — never hand-edit the lockfile.
- In `docs/ROADMAP.md`, only change the status of your own tasks.

## 5. Parallel work with git worktrees

All three agents run on the same machine. One folder can only have one branch checked out,
so **each agent works in its own worktree** (a separate folder sharing the same `.git`):

```bash
# from the main checkout (C:\Users\Kadir\desktop\mardin-audio-guide), once per agent
git fetch origin
git worktree add ../mag-claude      -b claude/t3-db-connection      origin/main
git worktree add ../mag-codex       -b codex/t5-ci-and-tests        origin/main
git worktree add ../mag-antigravity -b antigravity/t4-design-system origin/main

cd ../mag-codex && npm install       # each worktree needs its own node_modules
cp .env.example .env.local           # each worktree needs its own env file (never committed)
```

- The main checkout stays on `main` and is used only for pulling and reviewing.
- New task in the same worktree: `git fetch origin && git switch -c <agent>/<task> origin/main`.
- Housekeeping: `git worktree list`, and after merge `git worktree remove ../mag-codex` or reuse it.
- Never check out another agent's branch in your worktree; never commit in another agent's worktree.
- Dev server ports: Claude `3000`, Codex `3001`, Antigravity `3002` (`npm run dev -- -p 3001`).

## 6. Branches, commits, PRs

- **Branch name:** `<agent>/<task-id>-<short-kebab-desc>` — e.g. `claude/t3-db-connection`,
  `codex/t10-qr-generator`, `antigravity/t7-place-page`. One task per branch.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:`, `chore:` — optional scope,
  e.g. `feat(admin): add publish button`. Imperative mood, English, ≤ 72-char subject.
- **PRs:** one PR per task into `main`. Title = task id + summary (`T7: place detail page`).
  Description: what changed, how to verify, which shared files were touched, screenshots for UI.
  CI must be green. Squash-merge. The user (repo owner) merges; agents never merge their own PR.
- **No direct pushes to `main`** (exception: the T0–T2 bootstrap day).

## 7. Definition of Done

A task is done only when **all** of these hold:
1. `npm run lint`, `npm run typecheck` and `npm run build` pass with no errors (and `npm run test` once tests exist).
2. The ROADMAP acceptance criterion for the task is met.
3. Changes are committed with Conventional Commit messages and pushed; a PR is open.
4. No files outside your ownership were changed (or the PR explains why).
5. New env vars are added to `.env.example` (empty value) and documented.

## 8. Content accuracy rule (non-negotiable)

- **Unverified historical information is never published.**
- Every place's canonical (Turkish) text must link to at least one `Source`. Content without a source stays `DRAFT`.
- AI-researched text always enters as `DRAFT` with its source links, and only the admin can publish it.
  The server enforces this (publish fails without ≥ 1 source); the UI is not trusted.
- Machine translations (TR→EN and later other locales) are generated from **published** canonical text only,
  are published automatically, and are always shown with a visible "Machine-translated" label.
- Never invent dates, names, architects or events in seed data, fixtures or placeholders. Use obvious
  placeholders like `Lorem ipsum` / `TODO` for fake content, and keep fake data out of production.

## 9. Secrets

- Never commit secrets. `.env*` is git-ignored except `.env.example`, which holds **empty** values only.
- Real values live in `.env.local` (per worktree) and in Vercel project settings.
- Don't print secrets in logs, PR descriptions, test snapshots or screenshots.
- If a secret is committed by mistake, stop and tell the user — it must be rotated, not just deleted.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
