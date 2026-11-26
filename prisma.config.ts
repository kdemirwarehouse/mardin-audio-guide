// Prisma CLI configuration (Prisma 7+). Not used at runtime by the Next.js app.
// Prisma 7 does not load env files itself, so we load them here: .env.local first (Next.js convention), then .env.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed script is owned by Codex (ROADMAP T6) and will be wired here.
  },
  datasource: {
    // Migrations use the direct (non-pooled) Neon connection; the app will use DATABASE_URL (pooled) via a driver adapter (T3).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
