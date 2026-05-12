import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChefHat, Phone, Mail, MapPin } from "lucide-react";
import { useLocale } from "next-intl";

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="bg-restaurant-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-restaurant-gold rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Restorant
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Experience the finest cuisine crafted with passion and served with love. 
              Every dish tells a story.
            </p>
            <div className="flex gap-4">
              {["facebook", "instagram", "twitter"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-restaurant-gold flex items-center justify-center transition-colors text-xs font-bold uppercase"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-restaurant-gold mb-4 tracking-wide uppercase text-sm">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: `/${locale}`, label: "Home" },
                { href: `/${locale}/menu`, label: "Our Menu" },
                { href: `/${locale}/orders`, label: "My Orders" },
                { href: `/${locale}/wallet`, label: "Wallet" },
                { href: `/${locale}/support`, label: "Support" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-restaurant-gold transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-restaurant-gold mb-4 tracking-wide uppercase text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-restaurant-gold shrink-0 mt-0.5" />
                <span>123 Gourmet Avenue, Food City</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="w-4 h-4 text-restaurant-gold" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="w-4 h-4 text-restaurant-gold" />
                <span>hello@restorant.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Restorant. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Crafted with passion ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
