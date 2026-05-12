import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewProductPage({ params }: PageProps) {
  const { locale } = await params;
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Add New Product
      </h1>
      <ProductForm categories={categories} locale={locale} />
    </div>
  );
}
