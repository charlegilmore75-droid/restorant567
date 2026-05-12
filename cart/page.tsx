"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    nameAr?: string | null;
    price: number;
    image?: string | null;
  };
}

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    fetch("/api/cart/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (productId: string) => {
    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
    fetchCart();
  };

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const getName = (item: CartItem) => {
    if (locale === "ar" && item.product.nameAr) return item.product.nameAr;
    return item.product.name;
  };

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <ShoppingCart className="w-8 h-8 text-restaurant-gold" />
            {t("title")}
          </h1>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-medium text-gray-500 mb-6">{t("empty")}</p>
              <Link href={`/${locale}/menu`} className="inline-flex items-center gap-2 bg-restaurant-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-restaurant-gold/90 transition-colors">
                {t("browse")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={item.product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
                        alt={getName(item)}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{getName(item)}</h3>
                      <p className="text-restaurant-gold font-bold mt-1">{formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.product.price * item.quantity)}</p>
                      <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">{t("items")}</h2>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t("subtotal")}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                      <span>{t("total")}</span>
                      <span className="text-restaurant-gold">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/checkout`}
                    className="w-full flex items-center justify-center gap-2 bg-restaurant-gold text-white py-3.5 rounded-xl font-semibold hover:bg-restaurant-gold/90 transition-colors shadow-md"
                  >
                    {t("checkout")} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
