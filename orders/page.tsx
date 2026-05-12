"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SupportButton } from "@/components/support-button";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Package, ChevronRight, Loader2 } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { quantity: number; product: { name: string } }[];
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="restaurant-gradient pt-12 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{t("title")}</h1>
            <div className="w-16 h-1 bg-restaurant-gold rounded mx-auto" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-medium text-gray-500 mb-6">{t("empty")}</p>
              <Link href={`/${locale}/menu`} className="inline-flex items-center gap-2 bg-restaurant-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-restaurant-gold/90 transition-colors">
                Browse Menu <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{t("order_number")}{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                        {t(order.status as keyof ReturnType<typeof useTranslations>)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-restaurant-gold">{formatCurrency(order.total)}</span>
                    <Link
                      href={`/${locale}/orders/${order.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-restaurant-gold transition-colors"
                    >
                      {t("view")} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <SupportButton />
      <Footer />
    </div>
  );
}
