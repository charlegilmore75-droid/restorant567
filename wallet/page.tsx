"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SupportButton } from "@/components/support-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  type: "RECHARGE" | "PURCHASE" | "REFUND";
  description?: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

const AMOUNTS = [10, 20, 50, 100, 200];

export default function WalletPage() {
  const t = useTranslations("wallet");
  const locale = useLocale();
  const [data, setData] = useState<WalletData>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recharging, setRecharging] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchWallet = () => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleRecharge = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount < 1) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setRecharging(true);
    try {
      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { setSuccess(false); fetchWallet(); }, 1500);
      }
    } finally {
      setRecharging(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "RECHARGE") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (type === "REFUND") return <RefreshCcw className="w-4 h-4 text-blue-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTypeColor = (type: string) => {
    if (type === "RECHARGE") return "text-green-600";
    if (type === "REFUND") return "text-blue-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-restaurant-cream">
      <Navbar />
      <div className="pt-20">
        <div className="restaurant-gradient pt-12 pb-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{t("title")}</h1>
            <div className="w-16 h-1 bg-restaurant-gold rounded mx-auto" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-restaurant-gold" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-restaurant-dark to-restaurant-dark/80 rounded-3xl p-8 text-white shadow-xl mb-6">
                  <div className="w-14 h-14 bg-restaurant-gold/20 rounded-2xl flex items-center justify-center mb-5">
                    <Wallet className="w-7 h-7 text-restaurant-gold" />
                  </div>
                  <p className="text-white/60 text-sm mb-2">{t("balance")}</p>
                  <p className="text-4xl font-bold">{formatCurrency(data.balance)}</p>
                </div>

                {/* Recharge */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-restaurant-gold" /> {t("recharge_title")}
                  </h2>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setSelectedAmount(a); setCustomAmount(""); }}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                          selectedAmount === a && !customAmount
                            ? "border-restaurant-gold bg-restaurant-gold/10 text-restaurant-gold"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        ${a}
                      </button>
                    ))}
                    <input
                      type="number"
                      placeholder="Other"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                      className="col-span-3 py-2.5 px-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-restaurant-gold"
                    />
                  </div>
                  <button
                    onClick={handleRecharge}
                    disabled={recharging}
                    className="w-full bg-restaurant-gold text-white py-3 rounded-xl font-semibold hover:bg-restaurant-gold/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {success ? (
                      <><CheckCircle2 className="w-4 h-4" /> Added!</>
                    ) : recharging ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <>{t("confirm_recharge")}</>
                    )}
                  </button>
                </div>
              </div>

              {/* Transactions */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">{t("history")}</h2>
                </div>
                {data.transactions.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {data.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{t(tx.type as never)}</p>
                          {tx.description && <p className="text-xs text-gray-500 truncate">{tx.description}</p>}
                          <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={`font-bold text-sm ${getTypeColor(tx.type)}`}>
                          {tx.type === "PURCHASE" ? "-" : "+"}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <SupportButton />
      <Footer />
    </div>
  );
}
