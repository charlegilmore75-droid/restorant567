import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Edit Product
      </h1>
      <ProductForm product={product} categories={categories} locale={locale} />
    </div>
  );
}
