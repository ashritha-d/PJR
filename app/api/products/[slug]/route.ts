import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: "ACTIVE",
      id: { not: product.id },
    },
    take: 4,
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: { select: { name: true } } },
  });

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      subcategory: product.subcategory,
      description: product.description,
      farmSource: product.farmSource,
      storageInstructions: product.storageInstructions,
      deliveryInfo: product.deliveryInfo,
      price: product.price,
      discountPrice: product.discountPrice,
      sku: product.sku,
      stock: product.stock,
      unit: product.unit,
      weight: product.weight,
      availability: product.availability,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      images: product.images.map((i) => i.url),
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        userName: r.user.name,
        createdAt: r.createdAt,
      })),
    },
    related: related.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      unit: p.unit,
      weight: p.weight,
      availability: p.availability,
      stock: p.stock,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      image: p.images[0]?.url ?? "",
    })),
  });
}
