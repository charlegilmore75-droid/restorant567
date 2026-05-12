import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auth-utils";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const payments = await prisma.paymentSettings.findMany();
  // Don't expose secret keys in GET
  const safe = payments.map(({ secretKey: _, webhookSecret: __, ...p }) => ({
    ...p,
    hasSecretKey: !!_,
    hasWebhookSecret: !!__,
  }));

  return NextResponse.json({ payments: safe });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { provider, isEnabled, publicKey, secretKey, webhookSecret } = await req.json();

  if (!provider) return NextResponse.json({ error: "Provider required" }, { status: 400 });

  const settings = await prisma.paymentSettings.upsert({
    where: { provider },
    update: {
      isEnabled,
      ...(publicKey !== undefined ? { publicKey: publicKey || null } : {}),
      ...(secretKey !== undefined ? { secretKey: secretKey || null } : {}),
      ...(webhookSecret !== undefined ? { webhookSecret: webhookSecret || null } : {}),
    },
    create: { provider, isEnabled, publicKey, secretKey, webhookSecret },
  });

  await logAction(session.user.id, "UPDATE_PAYMENT_SETTINGS", `Updated ${provider} payment settings`);
  return NextResponse.json({ success: true });
}
