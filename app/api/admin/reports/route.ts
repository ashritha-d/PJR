import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")! + "T23:59:59") : new Date();

  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: from, lte: to } },
    include: { items: { include: { product: { select: { categoryId: true, category: { select: { name: true } } } } } } },
  });

  const nonCancelled = orders.filter((o) => o.status !== "CANCELLED");
  const totalRevenue = nonCancelled.reduce((s, o) => s + o.grandTotal, 0);
  const totalOrders = orders.length;
  const avgOrderValue = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;

  const newCustomers = await prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: from, lte: to } } });

  const dailySales = new Map<string, number>();
  const dayCount = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
  for (let i = 0; i <= dayCount; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    if (d > to) break;
    dailySales.set(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), 0);
  }
  for (const o of nonCancelled) {
    const key = new Date(o.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    if (dailySales.has(key)) dailySales.set(key, (dailySales.get(key) ?? 0) + o.grandTotal);
  }

  const ordersByStatus = ORDER_STATUSES.map((s) => ({
    status: ORDER_STATUS_LABELS[s],
    count: orders.filter((o) => o.status === s).length,
  }));

  const categoryTotals = new Map<string, number>();
  const productTotals = new Map<string, { name: string; revenue: number; quantity: number }>();
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const catName = item.product.category.name;
      categoryTotals.set(catName, (categoryTotals.get(catName) ?? 0) + item.lineTotal);

      const existing = productTotals.get(item.productId);
      if (existing) {
        existing.revenue += item.lineTotal;
        existing.quantity += item.quantity;
      } else {
        productTotals.set(item.productId, { name: item.name, revenue: item.lineTotal, quantity: item.quantity });
      }
    }
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;
  const inventoryReport = await prisma.product.findMany({
    where: { stock: { lte: lowStockThreshold } },
    orderBy: { stock: "asc" },
    select: { id: true, name: true, sku: true, stock: true, unit: true },
  });

  return NextResponse.json({
    summary: { totalRevenue, totalOrders, avgOrderValue: Math.round(avgOrderValue), newCustomers },
    dailySales: Array.from(dailySales.entries()).map(([date, sales]) => ({ date, sales: Math.round(sales) })),
    ordersByStatus,
    salesByCategory: Array.from(categoryTotals.entries()).map(([name, value]) => ({ name, value: Math.round(value) })),
    topProducts: Array.from(productTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue) })),
    inventoryReport,
  });
}
