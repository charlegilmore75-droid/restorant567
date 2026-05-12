"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, ChefHat, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

interface CartCount {
  count: number;
}

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN" || 
                  (session?.user as { role?: string })?.role === "SUPERADMIN";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((d: CartCount) => setCartCount(d.count || 0))
        .catch(() => {});
    }
  }, [session]);

  const navLink = (href: string) => `/${locale}${href}`;
  const isActive = (href: string) => pathname === `/${locale}${href}`;

  const links = [
    { href: "/", label: t("home") },
    { href: "/menu", label: t("menu") },
    ...(session?.user ? [
      { href: "/orders", label: t("orders") },
      { href: "/wallet", label: t("wallet") },
    ] : []),
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled || mobileOpen
        ? "bg-restaurant-dark/95 backdrop-blur-md shadow-lg"
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={navLink("/")} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-restaurant-gold rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              Restorant
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={navLink(l.href)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(l.href)
                    ? "bg-restaurant-gold text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {session?.user ? (
              <>
                {isAdmin && (
                  <Link href={navLink("/admin")} className="hidden md:flex items-center gap-1 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t("admin")}</span>
                  </Link>
                )}
                <Link href={navLink("/cart")} className="relative p-2 text-white/80 hover:text-white transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-restaurant-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{session.user.name?.split(" ")[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[180px] overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href={navLink("/support")} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      {t("support")}
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href={navLink("/login")} className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors">
                  {t("login")}
                </Link>
                <Link href={navLink("/register")} className="px-4 py-2 text-sm bg-restaurant-gold text-white rounded-lg hover:bg-restaurant-gold/90 transition-colors">
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-restaurant-dark/98 border-t border-white/10 px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={navLink(l.href)}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive(l.href)
                  ? "bg-restaurant-gold text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              {isAdmin && (
                <Link href={navLink("/admin")} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10">
                  {t("admin")}
                </Link>
              )}
              <Link href={navLink("/support")} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10">
                {t("support")}
              </Link>
              <button
                onClick={() => { signOut({ callbackUrl: `/${locale}/login` }); setMobileOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-white/10"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href={navLink("/login")} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10">
                {t("login")}
              </Link>
              <Link href={navLink("/register")} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm bg-restaurant-gold text-white">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
