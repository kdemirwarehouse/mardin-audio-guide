import type { Metadata } from "next";
import "../../globals.css";

// Admin has its own root layout and is not localized (ADR-007). Auth is added in ROADMAP T11.
export const metadata: Metadata = {
  title: "Yönetim · Mardin Sesli Rehber",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="tr">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
