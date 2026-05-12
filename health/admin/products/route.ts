import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/auth-utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  nameDe: z.string().optional(),
  nameFr: z.string().optional(),
  nameRu: z.string().optional(),
  description: z.string().optional(),
  descAr: z.string().optional(),
  descDe: z.string().optional(),
  descFr: z.string().optional(),
  descRu: z.string().optional(),
  price: z.number().positive(),
  image: z.string().optional(),
  categoryId: z.string(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const data = schema.parse(body);

  const product = await prisma.product.create({ data });
  await logAction(session.user.id, "CREATE_PRODUCT", `Created product: ${product.name}`);

  return NextResponse.json({ product }, { status: 201 });
}
