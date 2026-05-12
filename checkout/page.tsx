"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CheckCircle2, Wallet, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; image?: string | null };
}

interface WalletData {
  balance: number;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wallet, setWallet] = useState<WalletData>({ balance: 0 });
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/cart/items").then((r) => r.json()),
      fetch("/api/wallet").then((r) => r.json()),
    ]).then(([cartData, walletData]) => {
      setItems(cartData.items || []);
      setWallet(walletData);
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((a, i) => a + i.product.price * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { toast({ title: t("address_required"), variant: "destructive" }); return; }
    if (!phone.trim()) { toast({ title: t("phone_required"), variant: "destructive" }); return; }
    if (paymentMethod === "wallet" && wallet.balance < subtotal) {
      toast({ title: t("insufficient"), variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, phone, notes, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/orders`), 2000);
    } catch (err: unknown) {
      toast({ title: (err as Error).message || "Order failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-restaurant-cream flex items-center justify-center">
        <div className="text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t("title")}
          </h1>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-restaurant-gold" /> {t("delivery")}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("address")} *</label>
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm resize-none" placeholder="Enter your full delivery address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("phone")} *</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("notes")}</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm resize-none" placeholder="Allergies, special requests..." />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-restaurant-gold" /> {t("payment")}
                  </h2>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "wallet" ? "border-restaurant-gold bg-restaurant-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" value="wallet" checked={paymentMethod === "wallet"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-restaurant-gold" />
                      <div>
                        <p className="font-semibold text-gray-900">{t("wallet")}</p>
                        <p className="text-sm text-gray-500">{t("balance")}: <span className={wallet.balance >= subtotal ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>{formatCurrency(wallet.balance)}</span></p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cash" ? "border-restaurant-gold bg-restaurant-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" value="cash" checked={paymentMethod === "cash"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-restaurant-gold" />
                      <div>
                        <p className="font-semibold text-gray-900">{t("cash")}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                  <h2 className="font-bold text-gray-900 mb-5">{t("order_summary")}</h2>
                  <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-restaurant-gold text-lg">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-restaurant-gold text-white py-3.5 rounded-xl font-semibold hover:bg-restaurant-gold/90 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("place_order")}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
