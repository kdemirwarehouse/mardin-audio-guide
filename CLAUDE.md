@AGENTS.md

## Claude Code notes

- Your worktree: `../mag-claude`, branch prefix `claude/`, dev port `3000`.
- You own architecture: data model, API, admin + auth, publish/translation flow, TTS pipeline, `vercel.json`.
  Vercel / Neon / Blob dashboard settings belong to the human (Cabir) — never change them yourself.
  Record every non-trivial architecture decision as a new ADR in `docs/DECISIONS.md`.
- Next.js 16: middleware is `src/proxy.ts`; `params` / `searchParams` / `cookies()` / `headers()` are async.
  Check `node_modules/next/dist/docs/` before using an API you are unsure about.
- The publish guard (≥ 1 source, admin only) lives server-side in `src/server/`; never rely on UI checks.
- The user is learning: when proposing a decision, add a one-sentence "why".
- Ask before destructive DB operations (migrate reset, dropping columns) or anything touching production.
