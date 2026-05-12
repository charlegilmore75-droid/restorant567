import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive().min(1).max(10000),
  paymentMethod: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { amount } = schema.parse(body);

  // In a real app, process payment via Stripe/PayPal first
  // For now, simulate successful payment and credit wallet directly
  const [user, transaction] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { walletBalance: { increment: amount } },
      select: { walletBalance: true },
    }),
    prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        amount,
        type: "RECHARGE",
        description: "Manual wallet recharge",
      },
    }),
  ]);

  return NextResponse.json({ balance: user.walletBalance, transaction });
}
