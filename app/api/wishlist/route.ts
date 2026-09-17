import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
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
      availability: i.product.availability,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { productId } = (await req.json()) as { productId: string };
  if (!productId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: {},
    create: { userId: session.user.id, productId },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } });

  return NextResponse.json({ success: true });
}
