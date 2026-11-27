// Prisma client singleton for Neon (ROADMAP T3, ADR-014). Server-only: never import this from a client component.
//
// - The app talks to Neon through the *pooled* DATABASE_URL; migrations use DIRECT_URL (see prisma.config.ts).
// - The client is created lazily, so importing this module never needs a database. This keeps
//   `npm run build` working in CI where there is no DB (ADR-013).
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Kept on globalThis so dev hot-reloads reuse one client instead of opening a new connection pool each time.
const globalForDb = globalThis as unknown as { __prisma?: PrismaClient };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): PrismaClient {
  if (!globalForDb.__prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Deliberately generic: never echo env values.
      throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    }
    globalForDb.__prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  }
  return globalForDb.__prisma;
}
