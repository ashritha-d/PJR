import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Package, Clock, CheckCircle2, Heart, ArrowRight } from "lucide-react";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, totalOrders, pendingOrders, completedOrders, wishlistCount, recentOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.count({
      where: { userId, status: { in: ["PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] } },
    }),
    prisma.order.count({ where: { userId, status: "DELIVERED" } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { placedAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: Package, color: "bg-forest-700" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "bg-gold-dark" },
    { label: "Completed Orders", value: completedOrders, icon: CheckCircle2, color: "bg-forest-600" },
    { label: "Wishlist Items", value: wishlistCount, icon: Heart, color: "bg-red-400" },
  ];

  return (
    <div>
      <h1 className="section-heading">Welcome back, {user?.name?.split(" ")[0]}!</h1>
      <p className="section-subheading">Here&apos;s a quick overview of your account.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`inline-flex rounded-xl ${s.color} p-2.5 text-cream-100`}>
              <s.icon size={20} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-forest-800">{s.value}</p>
            <p className="text-xs text-forest-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-forest-800">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-forest-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-soft"
              >
                <div>
                  <p className="font-semibold text-forest-800">{order.orderNumber}</p>
                  <p className="text-xs text-forest-500">{formatDate(order.placedAt)}</p>
                </div>
                <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <p className="font-semibold text-forest-800">{formatCurrency(order.grandTotal)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
