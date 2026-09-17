"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  placedAt: string;
  items: { id: string }[];
  grandTotal: number;
  paymentStatus: string;
  status: string;
};

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

export function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const columns: Column<Order>[] = [
    { key: "orderNumber", header: "Order ID", render: (o) => <span className="font-semibold text-forest-800">{o.orderNumber}</span> },
    { key: "customer", header: "Customer", render: (o) => o.customerName },
    { key: "date", header: "Date", render: (o) => formatDate(o.placedAt) },
    { key: "items", header: "Items", render: (o) => o.items.length },
    { key: "amount", header: "Amount", render: (o) => formatCurrency(o.grandTotal) },
    {
      key: "payment",
      header: "Payment",
      render: (o) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${o.paymentStatus === "PAID" ? "bg-forest-100 text-forest-700" : "bg-orange-50 text-orange-600"}`}>
          {o.paymentStatus}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>
          {ORDER_STATUS_LABELS[o.status]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-forest-600 hover:bg-forest-50">
          <Eye size={16} /> View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
          <input className="input-field pl-9" placeholder="Search by order ID, customer..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading orders...</div>
      ) : (
        <DataTable columns={columns} rows={orders} emptyMessage="No orders found." />
      )}
    </div>
  );
}
