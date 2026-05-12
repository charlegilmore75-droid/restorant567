import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Only superadmin can change roles" }, { status: 403 });
  }

  const { userId, role: newRole } = await req.json();
  const validRoles = ["CUSTOMER", "ADMIN", "SUPERADMIN"];
  if (!validRoles.includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Prevent removing own superadmin role
  if (userId === session.user.id && newRole !== "SUPERADMIN") {
    return NextResponse.json({ error: "Cannot change own role" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, email: true },
  });

  await logAction(session.user.id, "CHANGE_USER_ROLE", `${user.email} → ${newRole}`);

  return NextResponse.json({ success: true });
}
