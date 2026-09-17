import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true, phone: true } },
      coupon: true,
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await req.json()) as { status?: string; paymentStatus?: string; note?: string };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const updateData: Record<string, string> = {};
  if (body.status) updateData.status = body.status;
  if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;

  await prisma.order.update({ where: { id }, data: updateData });

  if (body.status && body.status !== order.status) {
    await prisma.orderStatusHistory.create({
      data: { orderId: id, status: body.status, note: body.note ?? `Status updated to ${ORDER_STATUS_LABELS[body.status] ?? body.status}` },
    });

    if (body.status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, availability: "IN_STOCK" },
        });
      }
    }

    const notificationTypeMap: Record<string, string> = {
      CONFIRMED: NOTIFICATION_TYPES.ORDER_CONFIRMED,
      SHIPPED: NOTIFICATION_TYPES.ORDER_SHIPPED,
      DELIVERED: NOTIFICATION_TYPES.ORDER_DELIVERED,
      CANCELLED: NOTIFICATION_TYPES.ORDER_CANCELLED,
    };

    await prisma.notification.create({
      data: {
        userId: order.userId,
        audience: "CUSTOMER",
        title: `Order ${ORDER_STATUS_LABELS[body.status] ?? body.status}`,
        message: `Your order ${order.orderNumber} is now ${ORDER_STATUS_LABELS[body.status] ?? body.status}.`,
        type: notificationTypeMap[body.status] ?? "ORDER_UPDATE",
      },
    });
  }

  const updated = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ order: updated });
}
