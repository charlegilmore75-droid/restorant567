import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auth-utils";

export async function GET() {
  const settings = await prisma.siteSettings.findFirst({ where: { id: "singleton" } });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: body,
    create: { id: "singleton", ...body },
  });

  await logAction(session.user.id, "UPDATE_SITE_SETTINGS", "Updated site settings");
  return NextResponse.json({ settings });
}
