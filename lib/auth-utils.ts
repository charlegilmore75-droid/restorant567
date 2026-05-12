import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      walletBalance: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== Role.SUPERADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function logAction(
  userId: string,
  action: string,
  details?: string,
  ipAddress?: string
) {
  await prisma.adminLog.create({
    data: { userId, action, details, ipAddress },
  });
}
