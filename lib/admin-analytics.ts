import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

const NON_CANCELLED = { not: "CANCELLED" };

export async function getDashboardStats() {
  const [
    totalSalesAgg,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: NON_CANCELLED } }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] } },
    }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
    prisma.product.count({ where: { stock: 0 } }),
  ]);

  return {
    totalSales: totalSalesAgg._sum.grandTotal ?? 0,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
  };
}

export async function getSalesOverview(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: since }, status: NON_CANCELLED },
    select: { placedAt: true, grandTotal: true },
  });

  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    buckets.set(key, 0);
  }

  for (const order of orders) {
    const key = new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + order.grandTotal);
  }

  return Array.from(buckets.entries()).map(([date, sales]) => ({ date, sales: Math.round(sales) }));
}

export async function getOrdersByStatus() {
  const counts = await Promise.all(
    ORDER_STATUSES.map(async (status) => ({
      status: ORDER_STATUS_LABELS[status],
      count: await prisma.order.count({ where: { status } }),
    }))
  );
  return counts;
}

export async function getRevenueByCategory() {
  const items = await prisma.orderItem.findMany({
    include: { product: { select: { categoryId: true, category: { select: { name: true } } } } },
  });

  const totals = new Map<string, number>();
  for (const item of items) {
    const name = item.product.category.name;
    totals.set(name, (totals.get(name) ?? 0) + item.lineTotal);
  }

  return Array.from(totals.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
}

export async function getMonthlySales(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: since }, status: NON_CANCELLED },
    select: { placedAt: true, grandTotal: true },
  });

  const buckets = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    buckets.set(key, 0);
  }

  for (const order of orders) {
    const key = new Date(order.placedAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + order.grandTotal);
  }

  return Array.from(buckets.entries()).map(([month, sales]) => ({ month, sales: Math.round(sales) }));
}

export async function getTopProducts(limit = 5) {
  const items = await prisma.orderItem.findMany({ select: { productId: true, name: true, lineTotal: true } });

  const totals = new Map<string, { name: string; revenue: number }>();
  for (const item of items) {
    const existing = totals.get(item.productId);
    if (existing) existing.revenue += item.lineTotal;
    else totals.set(item.productId, { name: item.name, revenue: item.lineTotal });
  }

  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));
}
