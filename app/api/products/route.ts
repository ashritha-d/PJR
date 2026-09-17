import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildProductQuery } from "@/lib/product-filters";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { where, orderBy } = buildProductQuery(searchParams);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize") ?? "12")));

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      subcategory: p.subcategory,
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
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
