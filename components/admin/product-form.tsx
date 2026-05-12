"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  nameAr?: string | null;
  nameDe?: string | null;
  nameFr?: string | null;
  nameRu?: string | null;
  description?: string | null;
  descAr?: string | null;
  price: number;
  image?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  sortOrder: number;
}

interface Props {
  product?: Product;
  categories: Category[];
  locale: string;
}

export function ProductForm({ product, categories, locale }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    nameAr: product?.nameAr || "",
    nameDe: product?.nameDe || "",
    nameFr: product?.nameFr || "",
    nameRu: product?.nameRu || "",
    description: product?.description || "",
    descAr: product?.descAr || "",
    price: product?.price?.toString() || "",
    image: product?.image || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    sortOrder: product?.sortOrder?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, price: parseFloat(form.price), sortOrder: parseInt(form.sortOrder) };
      const res = product
        ? await fetch(`/api/admin/products/${product.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast({ title: product ? "Product updated!" : "Product created!" });
        router.push(`/${locale}/admin/products`);
        router.refresh();
      } else {
        const d = await res.json();
        toast({ title: d.error || "Error", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", multiline = false) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={form[key] as string}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key] as string}
          onChange={(e) => setForm({ ...form, [key]: type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("name", "Name (EN) *")}
          {field("nameAr", "Name (AR)")}
          {field("nameDe", "Name (DE)")}
          {field("nameFr", "Name (FR)")}
          {field("nameRu", "Name (RU)")}
          {field("price", "Price *", "number")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("description", "Description (EN)", "text", true)}
          {field("descAr", "Description (AR)", "text", true)}
        </div>
        {field("image", "Image URL")}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {field("sortOrder", "Sort Order", "number")}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-restaurant-gold"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 accent-restaurant-gold"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-restaurant-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-restaurant-gold/90 transition-colors shadow-md disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {product ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
