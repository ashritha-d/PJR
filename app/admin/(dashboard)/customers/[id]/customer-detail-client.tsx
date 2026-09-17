"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Phone, Calendar, MapPin } from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  addresses: { id: string; label: string; line1: string; city: string; state: string; pincode: string }[];
  orders: { id: string; orderNumber: string; placedAt: string; grandTotal: number; status: string; items: { id: string }[] }[];
};

export function CustomerDetailClient({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data.customer);
        setLoading(false);
      });
  }, [customerId]);

  async function toggleStatus() {
    if (!customer) return;
    const newStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const res = await fetch(`/api/admin/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      toast.error("Could not update customer status");
      return;
    }
    setCustomer({ ...customer, status: newStatus });
    toast.success(`Customer ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  if (loading || !customer) return <div className="skeleton h-72" />;

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <div className="card p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-700 font-display text-xl font-bold text-cream-100">
            {customer.name.charAt(0)}
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-forest-800">{customer.name}</h2>
          <button
            onClick={toggleStatus}
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              customer.status === "ACTIVE" ? "bg-forest-100 text-forest-700" : "bg-red-50 text-red-500"
            }`}
          >
            {customer.status === "ACTIVE" ? "Active — click to deactivate" : "Inactive — click to activate"}
          </button>

          <div className="mt-5 space-y-2 text-left text-sm text-forest-600">
            <p className="flex items-center gap-2"><Mail size={14} /> {customer.email}</p>
            <p className="flex items-center gap-2"><Phone size={14} /> {customer.phone}</p>
            <p className="flex items-center gap-2"><Calendar size={14} /> Joined {formatDate(customer.createdAt)}</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Saved Addresses</h3>
          <div className="mt-3 space-y-3">
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-forest-400">No addresses saved.</p>
            ) : (
              customer.addresses.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-sm text-forest-600">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{a.label}: {a.line1}, {a.city}, {a.state} - {a.pincode}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 text-center">
            <p className="font-display text-xl font-bold text-forest-800">{customer.orders.length}</p>
            <p className="text-xs text-forest-500">Total Orders</p>
          </div>
          <div className="card p-4 text-center">
            <p className="font-display text-xl font-bold text-forest-800">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-forest-500">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-bold text-forest-800">Order History</h3>
        <div className="mt-4 space-y-3">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-forest-400">No orders placed yet.</p>
          ) : (
            customer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-forest-100 p-4 hover:bg-forest-50/50"
              >
                <div>
                  <p className="font-semibold text-forest-800">{o.orderNumber}</p>
                  <p className="text-xs text-forest-400">{formatDate(o.placedAt)} · {o.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-600">
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-semibold text-forest-800">{formatCurrency(o.grandTotal)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
