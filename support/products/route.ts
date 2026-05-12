import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { categoryId: category } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { nameAr: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ products });
}
