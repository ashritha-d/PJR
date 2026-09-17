import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { formatDate } from "@/lib/utils";

function toCsvValue(value: unknown) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: (string | number)[][]) {
  const lines = [headers.map(toCsvValue).join(",")];
  for (const row of rows) lines.push(row.map(toCsvValue).join(","));
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")! + "T23:59:59") : new Date();

  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: from, lte: to } },
    orderBy: { placedAt: "desc" },
    include: { items: true },
  });

  const csv = buildCsv(
    ["Order ID", "Date", "Customer", "Items", "Subtotal", "Discount", "Delivery", "Tax", "Grand Total", "Payment Method", "Payment Status", "Order Status"],
    orders.map((o) => [
      o.orderNumber,
      formatDate(o.placedAt),
      o.customerName,
      o.items.length,
      o.subtotal,
      o.discount,
      o.deliveryCharge,
      o.tax,
      o.grandTotal,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="pjr-farm-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
