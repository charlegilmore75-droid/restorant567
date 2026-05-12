import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, name: true, nameAr: true, price: true, image: true, isActive: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Filter out inactive products
  const activeItems = items.filter((i) => i.product.isActive);
  return NextResponse.json({ items: activeItems });
}
