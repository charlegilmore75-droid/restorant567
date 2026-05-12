import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip intl for API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Apply intl middleware
  const intlResponse = intlMiddleware(req);

  // Get locale from path
  const pathnameLocale = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  const locale = pathnameLocale || defaultLocale;

  // Check auth for protected routes
  const session = await auth();
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const isAdminRoute = pathWithoutLocale.startsWith("/admin");
  const isAuthRoute =
    pathWithoutLocale === "/login" || pathWithoutLocale === "/register";

  if (isAdminRoute) {
    if (!session?.user) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = (session.user as { role: string }).role;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  if (isAuthRoute && session?.user) {
    const role = (session.user as { role: string }).role;
    if (role === "ADMIN" || role === "SUPERADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
