import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Package } from "lucide-react";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-2xl p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto text-forest-600" size={64} />
        <h1 className="mt-6 font-display text-2xl font-bold text-forest-800 sm:text-3xl">
          Thank you for ordering from PJR Farm &amp; Agro Products.
        </h1>
        <p className="mt-3 text-forest-500">
          Your order has been placed successfully and is being prepared with care.
        </p>

        <div className="mt-8 rounded-2xl bg-forest-50 p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-forest-500">Order ID</p>
              <p className="font-display text-lg font-bold text-forest-800">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-forest-500">Order Date</p>
              <p className="text-sm font-medium text-forest-700">{formatDate(order.placedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-forest-500">Payment Method</p>
              <p className="text-sm font-medium text-forest-700">{order.paymentMethod}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-forest-100 pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-forest-600">
                <span className="flex items-center gap-1.5">
                  <Package size={14} /> {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-forest-100 pt-4 font-display text-lg font-bold text-forest-800">
            <span>Grand Total</span>
            <span>{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/account/orders/${order.orderNumber}`} className="btn-primary">
            View Order Details
          </Link>
          <Link href="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
