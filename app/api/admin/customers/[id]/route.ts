import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const customer = await prisma.user.findFirst({
    where: { id, role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      addresses: true,
      orders: { orderBy: { placedAt: "desc" }, include: { items: true } },
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  return NextResponse.json({ customer });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = (await req.json()) as { status: string };

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const customer = await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ customer });
}
