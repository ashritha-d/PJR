"use client";

import { useEffect, useState } from "react";
import { Download, TrendingUp, ShoppingBag, Receipt, UserPlus } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { SalesOverviewChart, OrdersOverviewChart, RevenueByCategoryChart, TopProductsChart } from "@/components/admin/AdminCharts";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatCurrency } from "@/lib/utils";

type ReportData = {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; newCustomers: number };
  dailySales: { date: string; sales: number }[];
  ordersByStatus: { status: string; count: number }[];
  salesByCategory: { name: string; value: number }[];
  topProducts: { name: string; revenue: number; quantity: number }[];
  inventoryReport: { id: string; name: string; sku: string; stock: number; unit: string }[];
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

export function ReportsClient() {
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?from=${from}&to=${to}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inventoryColumns: Column<ReportData["inventoryReport"][number]>[] = [
    { key: "name", header: "Product", render: (p) => p.name },
    { key: "sku", header: "SKU", render: (p) => p.sku },
    { key: "stock", header: "Stock", render: (p) => <span className={p.stock === 0 ? "font-semibold text-red-500" : "font-semibold text-orange-500"}>{p.stock} {p.unit}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div>
          <label className="label-field">From</label>
          <input type="date" className="input-field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label-field">To</label>
          <input type="date" className="input-field" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={load} className="btn-primary !py-2.5">Apply Filter</button>
        <div className="ml-auto flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => {
                setFrom(daysAgoISO(d));
                setTo(todayISO());
              }}
              className="btn-secondary !py-2 !text-xs"
            >
              Last {d}d
            </button>
          ))}
          <a href={`/api/admin/reports/export?from=${from}&to=${to}`} className="btn-gold !py-2 !text-xs">
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      {loading || !data ? (
        <div className="skeleton h-96" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(data.summary.totalRevenue)} icon={TrendingUp} accent="bg-forest-700" />
            <StatCard label="Total Orders" value={data.summary.totalOrders} icon={ShoppingBag} accent="bg-forest-600" />
            <StatCard label="Avg Order Value" value={formatCurrency(data.summary.avgOrderValue)} icon={Receipt} accent="bg-gold-dark" />
            <StatCard label="New Customers" value={data.summary.newCustomers} icon={UserPlus} accent="bg-earth-600" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-forest-800">Sales Over Time</h3>
              <div className="mt-4"><SalesOverviewChart data={data.dailySales} /></div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-forest-800">Orders by Status</h3>
              <div className="mt-4"><OrdersOverviewChart data={data.ordersByStatus} /></div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-forest-800">Sales by Category</h3>
              <div className="mt-4">
                {data.salesByCategory.length === 0 ? <p className="py-16 text-center text-sm text-forest-400">No sales in this range.</p> : <RevenueByCategoryChart data={data.salesByCategory} />}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-forest-800">Top Selling Products</h3>
              <div className="mt-4">
                {data.topProducts.length === 0 ? <p className="py-16 text-center text-sm text-forest-400">No sales in this range.</p> : <TopProductsChart data={data.topProducts} />}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display font-bold text-forest-800">Inventory Report (Low &amp; Out of Stock)</h3>
            <DataTable columns={inventoryColumns} rows={data.inventoryReport} emptyMessage="All products are well-stocked." />
          </div>
        </>
      )}
    </div>
  );
}
