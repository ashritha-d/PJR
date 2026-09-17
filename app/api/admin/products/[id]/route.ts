import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { images, ...data } = parsed.data;

  if (data.sku) {
    const existingSku = await prisma.product.findFirst({ where: { sku: data.sku, id: { not: id } } });
    if (existingSku) {
      return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
    }
  }

  const updateData: typeof data & { availability?: string } = { ...data };
  if (typeof data.stock === "number") {
    updateData.availability = data.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
  }

  await prisma.product.update({ where: { id }, data: updateData });

  if (images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: images.map((url, i) => ({ productId: id, url, order: i })),
    });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: "This product has past orders and cannot be deleted. Deactivate it instead." },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
