import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SupportButton } from "@/components/support-button";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";
import { ChevronRight, Star, Clock, Award } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 6,
    orderBy: { sortOrder: "asc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

async function getSiteSettings() {
  return prisma.siteSettings.findFirst({ where: { id: "singleton" } });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const navT = await getTranslations("nav");
  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getSiteSettings(),
  ]);

  const heroTitle =
    locale === "ar" && settings?.heroTitleAr
      ? settings.heroTitleAr
      : settings?.heroTitle || t("hero_title");
  const tagline =
    locale === "ar" && settings?.taglineAr
      ? settings.taglineAr
      : settings?.tagline || t("hero_subtitle");

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center restaurant-gradient overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-restaurant-gold/20 border border-restaurant-gold/40 rounded-full px-4 py-2 mb-6 text-restaurant-gold text-sm font-medium backdrop-blur-sm">
            <Star className="w-4 h-4 fill-restaurant-gold" />
            Premium Restaurant Experience
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {heroTitle}
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">{tagline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/menu`}
              className="inline-flex items-center gap-2 bg-restaurant-gold text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-restaurant-gold/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {t("order_now")}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/menu`}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              {t("view_menu")}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: t("quality"), desc: t("quality_desc"), color: "text-restaurant-gold" },
              { icon: Clock, title: t("fast"), desc: t("fast_desc"), color: "text-blue-500" },
              { icon: Star, title: t("support"), desc: t("support_desc"), color: "text-green-500" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 bg-restaurant-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-heading text-restaurant-dark mb-3">{t("categories")}</h2>
              <div className="w-16 h-1 bg-restaurant-gold rounded mx-auto" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {categories.map((cat) => {
                const catName =
                  locale === "ar" && cat.nameAr
                    ? cat.nameAr
                    : locale === "de" && cat.nameDe
                    ? cat.nameDe
                    : locale === "fr" && cat.nameFr
                    ? cat.nameFr
                    : locale === "ru" && cat.nameRu
                    ? cat.nameRu
                    : cat.name;
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/menu?category=${cat.id}`}
                    className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 hover:border-restaurant-gold hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-restaurant-gold/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-restaurant-gold transition-colors">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-center text-sm">{catName}</span>
                    <span className="text-xs text-gray-400 mt-1">{cat._count.products} dishes</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-14">
              <div>
                <h2 className="section-heading text-restaurant-dark mb-3">{t("featured")}</h2>
                <div className="w-16 h-1 bg-restaurant-gold rounded" />
              </div>
              <Link
                href={`/${locale}/menu`}
                className="text-restaurant-gold hover:underline text-sm font-medium flex items-center gap-1"
              >
                {t("view_menu")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SupportButton />
      <Footer />
    </div>
  );
}
