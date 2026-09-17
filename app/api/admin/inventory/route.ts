import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: "asc" },
      include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    getSiteSettings(),
  ]);

  return NextResponse.json({
    items: products,
    lowStockThreshold: settings.lowStockThreshold,
  });
}
