"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
};

export function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    const data = await res.json();
    setCustomers(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div>
          <p className="font-medium text-forest-800">{c.name}</p>
          <p className="text-xs text-forest-400">{c.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Mobile", render: (c) => c.phone },
    { key: "joined", header: "Registered", render: (c) => formatDate(c.createdAt) },
    { key: "orders", header: "Orders", render: (c) => c.totalOrders },
    { key: "spent", header: "Total Spent", render: (c) => formatCurrency(c.totalSpent) },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === "ACTIVE" ? "bg-forest-100 text-forest-700" : "bg-red-50 text-red-500"}`}>
          {c.status === "ACTIVE" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-1 rounded-lg px-2 py-1 text-forest-600 hover:bg-forest-50">
          <Eye size={16} /> View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
        <input className="input-field pl-9" placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading customers...</div>
      ) : (
        <DataTable columns={columns} rows={customers} emptyMessage="No customers found." />
      )}
    </div>
  );
}
