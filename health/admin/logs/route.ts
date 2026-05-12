import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const take = 30;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.adminLog.count(),
  ]);

  return NextResponse.json({ logs, total, page });
}
