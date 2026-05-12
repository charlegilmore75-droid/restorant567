"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  nameDe?: string | null;
  nameFr?: string | null;
  nameRu?: string | null;
  description?: string | null;
  price: number;
  image?: string | null;
  isFeatured?: boolean;
  category?: { name: string };
}

interface ProductCardProps {
  product: Product;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations("menu");
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getName = () => {
    if (locale === "ar" && product.nameAr) return product.nameAr;
    if (locale === "de" && product.nameDe) return product.nameDe;
    if (locale === "fr" && product.nameFr) return product.nameFr;
    if (locale === "ru" && product.nameRu) return product.nameRu;
    return product.name;
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
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        toast({ title: "Added to cart!", variant: "default" as never });
      }
    } catch {
      toast({ title: "Error adding to cart", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover group")}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Link href={`/${locale}/product/${product.id}`}>
          <Image
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"}
            alt={getName()}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-restaurant-gold text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <Star className="w-3 h-3 fill-white" />
            Featured
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-bold text-restaurant-dark shadow-md">
          {formatCurrency(product.price)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <Link href={`/${locale}/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-lg mb-1.5 hover:text-restaurant-gold transition-colors line-clamp-1">
            {getName()}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        )}
        {product.category && (
          <p className="text-xs text-restaurant-gold font-medium mb-4 uppercase tracking-wide">{product.category.name}</p>
        )}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-restaurant-dark text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-restaurant-gold transition-colors duration-200 disabled:opacity-70"
        >
          <ShoppingCart className="w-4 h-4" />
          {loading ? "Adding..." : t("add_to_cart")}
        </button>
      </div>
    </div>
  );
}
