import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SupportButton } from "@/components/support-button";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function MenuPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category, search } = await searchParams;
  const t = await getTranslations("menu");

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { categoryId: category } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />

      {/* Header */}
      <div className="restaurant-gradient pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t("title")}
          </h1>
          <div className="w-16 h-1 bg-restaurant-gold rounded mx-auto" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <form className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder={t("search")}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm shadow-sm"
            />
          </form>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          <a
            href={`/${locale}/menu`}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${!category ? "bg-restaurant-gold text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            {t("all")}
          </a>
          {categories.map((cat) => {
            const catName =
              locale === "ar" && cat.nameAr ? cat.nameAr :
              locale === "de" && cat.nameDe ? cat.nameDe :
              locale === "fr" && cat.nameFr ? cat.nameFr :
              locale === "ru" && cat.nameRu ? cat.nameRu :
              cat.name;
            return (
              <a
                key={cat.id}
                href={`/${locale}/menu?category=${cat.id}`}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${category === cat.id ? "bg-restaurant-gold text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
              >
                {catName}
              </a>
            );
          })}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl font-medium">{t("no_products")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </div>

      <SupportButton />
      <Footer />
    </div>
  );
}
