import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { OrderStatusTimeline } from "@/components/site/OrderStatusTimeline";
import { ChevronLeft } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getServerSession(authOptions);

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } }, coupon: true },
  });

  if (!order || order.userId !== session!.user.id) notFound();

  return (
    <div>
      <Link href="/account/orders" className="mb-4 flex items-center gap-1 text-sm font-medium text-forest-600 hover:underline">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">{order.orderNumber}</h1>
          <p className="section-subheading">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <span className="rounded-full bg-forest-100 px-4 py-1.5 text-sm font-semibold text-forest-700">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="card mt-8 p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <h2 className="font-display font-bold text-forest-800">Items</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-forest-50">
                  <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-forest-800">{item.name}</p>
                  <p className="text-xs text-forest-500">{item.unit} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-forest-800">{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-display font-bold text-forest-800">Order Timeline</h2>
          <div className="mt-4 space-y-3">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest-600" />
                <div>
                  <p className="font-medium text-forest-800">{ORDER_STATUS_LABELS[h.status]}</p>
                  {h.note && <p className="text-xs text-forest-500">{h.note}</p>}
                  <p className="text-xs text-forest-400">{formatDateTime(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-bold text-forest-800">Delivery Address</h2>
            <p className="mt-3 text-sm text-forest-600">{order.addressSnapshot}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-bold text-forest-800">Payment Summary</h2>
            <div className="mt-3 space-y-2 text-sm text-forest-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-forest-700">
                  <span>Discount{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryCharge === 0 ? "FREE" : formatCurrency(order.deliveryCharge)}</span></div>
              {order.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>}
              <div className="flex justify-between border-t border-forest-100 pt-2 font-display text-base font-bold text-forest-800">
                <span>Total</span><span>{formatCurrency(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between pt-2 text-xs text-forest-500">
                <span>Payment Method</span><span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs text-forest-500">
                <span>Payment Status</span><span>{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
