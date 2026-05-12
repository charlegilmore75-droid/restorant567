import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const thread = await prisma.supportThread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  if (thread.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!thread.isOpen) return NextResponse.json({ error: "Thread is closed" }, { status: 400 });

  const message = await prisma.supportMessage.create({
    data: { content, threadId, senderId: session.user.id, isAdmin: false },
    include: { sender: { select: { name: true } } },
  });

  await prisma.supportThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ message }, { status: 201 });
}
