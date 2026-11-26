import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

// Placeholder home page. Real UI is ROADMAP T7 (Antigravity).
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">{dict.site.name}</h1>
      <p className="mt-4 text-lg">{dict.site.tagline}</p>
      <p className="mt-8 opacity-70">{dict.home.comingSoon}</p>
    </main>
  );
}
