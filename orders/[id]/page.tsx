"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Package, ChevronLeft, Loader2, MapPin, Phone, StickyNote } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  address: string;
  phone: string;
  notes?: string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; image?: string | null };
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const t = useTranslations("orders");
  const locale = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .finally(() => setLoading(false));
  }, [params.id]);

  const statuses = ["PENDING", "DELAYED", "SENT", "RECEIVED"];

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href={`/${locale}/orders`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" /></div>
          ) : !order ? (
            <div className="text-center py-24 text-gray-500">Order not found</div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t("order_number")}{order.orderNumber}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`self-start sm:self-auto px-4 py-2 rounded-full text-sm font-semibold ${getOrderStatusColor(order.status)}`}>
                  {t(order.status as never)}
                </span>
              </div>

              {/* Status timeline */}
              {order.status !== "CANCELLED" && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-6">Order Progress</h2>
                  <div className="flex items-center">
                    {statuses.map((s, i) => {
                      const currentIdx = statuses.indexOf(order.status);
                      const done = i <= currentIdx;
                      return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-restaurant-gold text-white" : "bg-gray-100 text-gray-400"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 text-center px-2">
                            <p className={`text-xs font-medium ${done ? "text-restaurant-gold" : "text-gray-400"}`}>
                              {t(s as never)}
                            </p>
                          </div>
                          {i < statuses.length - 1 && (
                            <div className={`flex-1 h-0.5 ${i < currentIdx ? "bg-restaurant-gold" : "bg-gray-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-5">Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={item.product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-restaurant-gold text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-5">Delivery Details</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-restaurant-gold shrink-0 mt-0.5" />
                    <span>{order.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-restaurant-gold" />
                    <span>{order.phone}</span>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <StickyNote className="w-4 h-4 text-restaurant-gold shrink-0 mt-0.5" />
                      <span>{order.notes}</span>
                    </div>
                  )}
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
