import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { AdminProductActions } from "@/components/admin/product-actions";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminProductsPage({ params }: PageProps) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Products Management
        </h1>
        <Link
          href={`/${locale}/admin/products/new`}
          className="flex items-center gap-2 bg-restaurant-gold text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-restaurant-gold/90 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-44">
              <Image
                src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{product.category.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-restaurant-gold font-bold">{formatCurrency(product.price)}</span>
                <AdminProductActions productId={product.id} locale={locale} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
