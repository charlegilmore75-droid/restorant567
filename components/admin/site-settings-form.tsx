"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface Settings {
  siteName?: string | null;
  logo?: string | null;
  favicon?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  heroTitle?: string | null;
  heroTitleAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  phone?: string | null;
  address?: string | null;
  addressAr?: string | null;
  email?: string | null;
  currency?: string | null;
  currencySymbol?: string | null;
}

interface Props {
  settings: Settings | null;
}

export function SiteSettingsForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: settings?.siteName || "Restorant",
    logo: settings?.logo || "",
    favicon: settings?.favicon || "",
    primaryColor: settings?.primaryColor || "#C9A84C",
    accentColor: settings?.accentColor || "#1A1A2E",
    heroTitle: settings?.heroTitle || "Fine Dining Experience",
    heroTitleAr: settings?.heroTitleAr || "تجربة طعام راقية",
    tagline: settings?.tagline || "Crafted with passion, served with love",
    taglineAr: settings?.taglineAr || "مصنوع بشغف، يُقدَّم بمحبة",
    phone: settings?.phone || "",
    address: settings?.address || "",
    addressAr: settings?.addressAr || "",
    email: settings?.email || "",
    currency: settings?.currency || "USD",
    currencySymbol: settings?.currencySymbol || "$",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "Settings saved!" });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const textField = (key: keyof typeof form, label: string, type = "text") => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Brand Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textField("siteName", "Site Name")}
          {textField("email", "Contact Email")}
          {textField("phone", "Phone")}
          {textField("currency", "Currency Code")}
          {textField("currencySymbol", "Currency Symbol")}
        </div>
        {textField("logo", "Logo URL")}
        {textField("favicon", "Favicon URL")}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Homepage Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textField("heroTitle", "Hero Title (EN)")}
          {textField("heroTitleAr", "Hero Title (AR)")}
          {textField("tagline", "Tagline (EN)")}
          {textField("taglineAr", "Tagline (AR)")}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textField("address", "Address (EN)")}
          {textField("addressAr", "Address (AR)")}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-restaurant-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-restaurant-gold/90 transition-colors shadow-md disabled:opacity-70"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  );
}
