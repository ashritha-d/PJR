"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Clock, CreditCard } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

type PaymentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  placedAt: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
};

type ByMethod = { method: string; count: number; total: number };

export function PaymentsClient() {
  const [items, setItems] = useState<PaymentOrder[]>([]);
  const [byMethod, setByMethod] = useState<ByMethod[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setByMethod(data.byMethod ?? []);
        setTotalCollected(data.totalCollected ?? 0);
        setTotalPending(data.totalPending ?? 0);
        setLoading(false);
      });
  }, []);

  const columns: Column<PaymentOrder>[] = [
    { key: "order", header: "Order ID", render: (o) => <Link href={`/admin/orders/${o.id}`} className="font-semibold text-forest-700 hover:underline">{o.orderNumber}</Link> },
    { key: "customer", header: "Customer", render: (o) => o.customerName },
    { key: "date", header: "Date", render: (o) => formatDate(o.placedAt) },
    { key: "amount", header: "Amount", render: (o) => formatCurrency(o.grandTotal) },
    { key: "method", header: "Method", render: (o) => o.paymentMethod },
    {
      key: "status",
      header: "Payment Status",
      render: (o) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${o.paymentStatus === "PAID" ? "bg-forest-100 text-forest-700" : o.paymentStatus === "FAILED" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
          {o.paymentStatus}
        </span>
      ),
    },
  ];

  if (loading) return <div className="skeleton h-72" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Collected" value={formatCurrency(totalCollected)} icon={Wallet} accent="bg-forest-700" />
        <StatCard label="Pending Payments" value={formatCurrency(totalPending)} icon={Clock} accent="bg-orange-500" />
        {byMethod.map((m) => (
          <StatCard key={m.method} label={`${m.method} Orders`} value={m.count} icon={CreditCard} accent="bg-forest-600" hint={formatCurrency(m.total)} />
        ))}
      </div>

      <DataTable columns={columns} rows={items} emptyMessage="No payment records yet." />
    </div>
  );
}
