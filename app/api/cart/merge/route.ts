import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { items } = (await req.json()) as {
    items: { productId: string; quantity: number }[];
  };

  for (const item of items ?? []) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.status !== "ACTIVE") continue;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: item.productId } },
    });

    const newQty = Math.min(
      (existing?.quantity ?? 0) + item.quantity,
      Math.max(product.stock, 1)
    );

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId: item.productId } },
      update: { quantity: newQty },
      create: { userId: session.user.id, productId: item.productId, quantity: newQty },
    });
  }

  return NextResponse.json({ success: true });
}
