import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-blue-50 text-blue-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  PROCESSING: "bg-gold/20 text-gold-dark",
  PACKED: "bg-gold/20 text-gold-dark",
  SHIPPED: "bg-purple-50 text-purple-600",
  OUT_FOR_DELIVERY: "bg-purple-50 text-purple-600",
  DELIVERED: "bg-forest-100 text-forest-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { placedAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="section-heading">My Orders</h1>
      <p className="section-subheading">Track and review all your past orders.</p>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will show up here."
            actionHref="/products"
            actionLabel="Start Shopping"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="card block p-5 transition hover:shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display font-bold text-forest-800">{order.orderNumber}</p>
                    <p className="text-xs text-forest-500">Placed on {formatDate(order.placedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-600">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 overflow-x-auto">
                  {order.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-forest-50">
                      <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <span className="text-xs text-forest-400">+{order.items.length - 5} more</span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-forest-100 pt-3">
                  <span className="text-xs text-forest-500">{order.items.length} item(s)</span>
                  <span className="font-display font-bold text-forest-800">{formatCurrency(order.grandTotal)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
