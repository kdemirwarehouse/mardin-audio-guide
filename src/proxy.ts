import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { matchLocale } from "@/lib/i18n/negotiate";

/**
 * Locale routing (ADR-006): a public path without a locale prefix is redirected to
 * /{locale}/... using, in order: NEXT_LOCALE cookie, Accept-Language header, default (tr).
 * Admin, API, the QR route, Next internals and static files are excluded via `config.matcher`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  if (isLocale(firstSegment)) return NextResponse.next();

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip /admin, /api, /p/* (language-neutral QR route, T9), Next/Vercel internals, and files with an extension.
  matcher: ["/((?!admin|api|p/|_next|_vercel|.*\\..*).*)"],
};
