import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { select: { name: true, image: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { address, phone, notes, paymentMethod = "wallet" } = await req.json();

  if (!address?.trim()) return NextResponse.json({ error: "Address is required" }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cartItems.reduce((a, i) => a + i.product.price * i.quantity, 0);

  // Wallet payment check
  if (paymentMethod === "wallet") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } });
    if (!user || user.walletBalance < subtotal) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }
  }

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        address,
        phone,
        notes,
        subtotal,
        total: subtotal,
        paymentMethod,
        isPaid: paymentMethod === "wallet",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: true },
    });

    // Deduct from wallet
    if (paymentMethod === "wallet") {
      await tx.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: subtotal } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: session.user.id,
          amount: subtotal,
          type: "PURCHASE",
          description: `Order #${newOrder.orderNumber}`,
          reference: newOrder.id,
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

    return newOrder;
  });

  return NextResponse.json({ order }, { status: 201 });
}
