"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, ShoppingBag, Package, Settings,
  FileText, MessageSquare, CreditCard, ChefHat, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  locale: string;
  role: string;
}

export function AdminSidebar({ locale, role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = `/${locale}/admin`;

  const links = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/orders`, label: "Orders", icon: ShoppingBag },
    { href: `${base}/products`, label: "Products", icon: Package },
    { href: `${base}/users`, label: "Users", icon: Users },
    { href: `${base}/support`, label: "Support", icon: MessageSquare },
    { href: `${base}/logs`, label: "Activity Logs", icon: FileText },
    { href: `${base}/payments`, label: "Payments", icon: CreditCard },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-restaurant-gold rounded-lg flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Restorant</p>
          <p className="text-white/40 text-xs capitalize">{role.toLowerCase()} panel</p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== base && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-restaurant-gold text-white shadow-md shadow-restaurant-gold/30"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mb-1"
        >
          <ChefHat className="w-4 h-4" />
          View Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-restaurant-dark rounded-lg flex items-center justify-center text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-restaurant-dark flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 bg-restaurant-dark flex-col">
        <NavContent />
      </div>
    </>
  );
}
