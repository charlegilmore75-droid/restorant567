"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SupportButton } from "@/components/support-button";
import { ChevronLeft, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  nameDe?: string | null;
  nameFr?: string | null;
  nameRu?: string | null;
  description?: string | null;
  descAr?: string | null;
  descDe?: string | null;
  descFr?: string | null;
  descRu?: string | null;
  price: number;
  image?: string | null;
  category: { name: string; nameAr?: string | null };
}

export default function ProductPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("product");
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product))
      .finally(() => setFetching(false));
  }, [params.id]);

  const getName = () => {
    if (!product) return "";
    if (locale === "ar" && product.nameAr) return product.nameAr;
    if (locale === "de" && product.nameDe) return product.nameDe;
    if (locale === "fr" && product.nameFr) return product.nameFr;
    if (locale === "ru" && product.nameRu) return product.nameRu;
    return product.name;
  };

  const getDesc = () => {
    if (!product) return "";
    if (locale === "ar" && product.descAr) return product.descAr;
    if (locale === "de" && product.descDe) return product.descDe;
    if (locale === "fr" && product.descFr) return product.descFr;
    if (locale === "ru" && product.descRu) return product.descRu;
    return product.description || "";
  };

  const handleAddToCart = async () => {
    if (!session?.user) {
      router.push(`/${locale}/login`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id, quantity }),
      });
      if (res.ok) {
        toast({ title: "Added to cart!" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-restaurant-cream">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-restaurant-cream">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-xl text-gray-500">Product not found</p>
          <Link href={`/${locale}/menu`} className="text-restaurant-gold hover:underline">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const catName = locale === "ar" && product.category.nameAr
    ? product.category.nameAr
    : product.category.name;

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/${locale}/menu`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("back")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* Image */}
            <div className="relative h-80 lg:h-full min-h-[400px]">
              <Image
                src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"}
                alt={getName()}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span className="inline-block bg-restaurant-gold/10 text-restaurant-gold text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                {catName}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {getName()}
              </h1>
              {getDesc() && (
                <p className="text-gray-600 leading-relaxed mb-8">{getDesc()}</p>
              )}
              <div className="text-3xl font-bold text-restaurant-gold mb-8">
                {formatCurrency(product.price)}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium text-gray-700">{t("quantity")}</span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg bg-white shadow-sm hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg bg-white shadow-sm hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-restaurant-gold text-white py-4 rounded-2xl font-semibold text-lg hover:bg-restaurant-gold/90 transition-colors shadow-md disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {t("add_to_cart")} — {formatCurrency(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SupportButton />
      <Footer />
    </div>
  );
}
