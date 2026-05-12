import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auth-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["PENDING", "DELAYED", "SENT", "RECEIVED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Refund wallet if cancelling a paid wallet order
  if (status === "CANCELLED" && existingOrder.paymentMethod === "wallet" && existingOrder.isPaid) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status } });
      await tx.user.update({
        where: { id: existingOrder.userId },
        data: { walletBalance: { increment: existingOrder.total } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: existingOrder.userId,
          amount: existingOrder.total,
          type: "REFUND",
          description: `Refund for cancelled order #${existingOrder.orderNumber}`,
          reference: id,
        },
      });
    });
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
  }

  await logAction(session.user.id, "UPDATE_ORDER_STATUS", `Order #${existingOrder.orderNumber} → ${status}`);

  return NextResponse.json({ success: true });
}
