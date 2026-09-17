import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      placedAt: true,
      grandTotal: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
    },
  });

  const totalCollected = orders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.grandTotal, 0);
  const totalPending = orders.filter((o) => o.paymentStatus === "PENDING").reduce((s, o) => s + o.grandTotal, 0);
  const byMethod = ["COD", "UPI", "ONLINE"].map((method) => ({
    method,
    count: orders.filter((o) => o.paymentMethod === method).length,
    total: orders.filter((o) => o.paymentMethod === method).reduce((s, o) => s + o.grandTotal, 0),
  }));

  return NextResponse.json({ items: orders, totalCollected, totalPending, byMethod });
}
