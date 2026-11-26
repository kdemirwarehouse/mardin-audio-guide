import type { Metadata } from "next";
import "./globals.css";

// Required because the app has two root layouts (site + admin), see ADR-007.
export const metadata: Metadata = {
  title: "404 · Mardin Audio Guide",
};

export default function GlobalNotFound() {
  return (
    <html lang="tr">
      <body className="min-h-dvh antialiased">
        <main className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-2xl font-semibold">Sayfa bulunamadı · Page not found</h1>
          <p className="mt-4">
            {/* Plain <a>: navigation crosses root layouts, so a full page load is expected. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="underline" href="/tr">Ana sayfa</a> ·{" "}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="underline" href="/en">Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
