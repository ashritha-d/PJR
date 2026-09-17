import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ items: [] });

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.images[0]?.url ?? "",
      price: i.product.price,
      discountPrice: i.product.discountPrice,
      unit: i.product.unit,
      stock: i.product.stock,
      availability: i.product.availability,
      quantity: i.quantity,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const body = await req.json();
  const { productId, quantity } = body as { productId: string; quantity: number };

  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  const newQty = Math.min((existing?.quantity ?? 0) + quantity, Math.max(product.stock, 1));

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: newQty },
    create: { userId, productId, quantity: newQty },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { productId, quantity } = (await req.json()) as {
    productId: string;
    quantity: number;
  };

  if (!productId || quantity < 1) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
  } else {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  return NextResponse.json({ success: true });
}
