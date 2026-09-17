import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { action, amount } = (await req.json()) as { action: "add" | "reduce" | "set"; amount: number };

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let newStock = product.stock;
  if (action === "add") newStock = product.stock + amount;
  else if (action === "reduce") newStock = Math.max(0, product.stock - amount);
  else if (action === "set") newStock = Math.max(0, amount);

  const updated = await prisma.product.update({
    where: { id },
    data: { stock: newStock, availability: newStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK" },
  });

  return NextResponse.json({ product: updated });
}
