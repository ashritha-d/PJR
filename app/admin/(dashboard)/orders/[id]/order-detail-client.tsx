"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { OrderStatusTimeline } from "@/components/site/OrderStatusTimeline";
import { formatCurrency, formatDate, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  grandTotal: number;
  addressSnapshot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  placedAt: string;
  items: { id: string; name: string; unit: string; image: string; price: number; quantity: number; lineTotal: number }[];
  statusHistory: { id: string; status: string; note: string | null; createdAt: string }[];
  coupon: { code: string } | null;
};

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/orders/${orderId}`);
    const data = await res.json();
    setOrder(data.order);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function updateStatus(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdating(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not update order");
      return;
    }
    setOrder(data.order);
    toast.success(`Order marked as ${ORDER_STATUS_LABELS[status]}`);
  }

  async function updatePaymentStatus(paymentStatus: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    const data = await res.json();
    setUpdating(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not update payment status");
      return;
    }
    setOrder(data.order);
    toast.success("Payment status updated");
  }

  if (loading || !order) {
    return <div className="skeleton h-96" />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-forest-800">{order.orderNumber}</h2>
          <p className="text-sm text-forest-500">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="input-field w-auto"
            value={order.status}
            disabled={updating}
            onChange={(e) => updateStatus(e.target.value)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            className="input-field w-auto"
            value={order.paymentStatus}
            disabled={updating}
            onChange={(e) => updatePaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Items</h3>
          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-forest-50">
                  <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-forest-800">{item.name}</p>
                  <p className="text-xs text-forest-500">{item.unit} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-forest-800">{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-8 font-display font-bold text-forest-800">Status History</h3>
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
            <h3 className="font-display font-bold text-forest-800">Customer</h3>
            <p className="mt-2 text-sm text-forest-600">{order.customerName}</p>
            <p className="text-sm text-forest-500">{order.customerPhone}</p>
            <p className="text-sm text-forest-500">{order.customerEmail}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-forest-800">Delivery Address</h3>
            <p className="mt-2 text-sm text-forest-600">{order.addressSnapshot}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-forest-800">Payment Summary</h3>
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
            </div>
          </div>
        </div>
      </div>

      {updating && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-sm text-white shadow-soft">
          <Loader2 size={14} className="animate-spin" /> Updating...
        </div>
      )}
    </div>
  );
}
