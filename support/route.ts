import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.supportThread.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ threads });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const thread = await prisma.supportThread.create({
    data: {
      subject,
      userId: session.user.id,
      messages: {
        create: {
          content: message,
          senderId: session.user.id,
          isAdmin: false,
        },
      },
    },
    include: {
      messages: {
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
