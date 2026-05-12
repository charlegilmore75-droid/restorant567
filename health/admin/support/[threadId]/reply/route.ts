import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { threadId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const thread = await prisma.supportThread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const message = await prisma.supportMessage.create({
    data: {
      content,
      threadId,
      senderId: session.user.id,
      isAdmin: true,
    },
    include: { sender: { select: { name: true } } },
  });

  await prisma.supportThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ message }, { status: 201 });
}
