import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ items: products });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { images, ...data } = parsed.data;
  let slug = slugify(data.name);
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) {
    return NextResponse.json({ error: "A product with this SKU already exists" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      availability: data.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      images: {
        create: (images ?? []).map((url, i) => ({ url, order: i })),
      },
    },
  });

  return NextResponse.json({ product });
}
