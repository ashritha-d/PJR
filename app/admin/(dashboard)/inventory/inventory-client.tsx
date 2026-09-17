"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Minus, AlertTriangle } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
  images: { url: string }[];
  category: { name: string };
};

export function InventoryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setProducts(data.items ?? []);
    setThreshold(data.lowStockThreshold ?? 10);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function adjustStock(id: string, action: "add" | "reduce") {
    const amount = Number(amounts[id] ?? 1);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    const res = await fetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not update stock");
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: data.product.stock } : p)));
    toast.success(`Stock ${action === "add" ? "added" : "reduced"} successfully`);
  }

  const filtered = products.filter((p) => {
    if (filter === "low") return p.stock > 0 && p.stock <= threshold;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const stats = {
    total: products.length,
    low: products.filter((p) => p.stock > 0 && p.stock <= threshold).length,
    out: products.filter((p) => p.stock === 0).length,
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-forest-50">
            <Image src={p.images[0]?.url || "/placeholders/vegetables.svg"} alt={p.name} fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <p className="font-medium text-forest-800">{p.name}</p>
            <p className="text-xs text-forest-400">{p.sku} · {p.category.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Current Stock",
      render: (p) => (
        <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : p.stock <= threshold ? "text-orange-500" : "text-forest-700"}`}>
          {p.stock} {p.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) =>
        p.stock === 0 ? (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">Out of Stock</span>
        ) : p.stock <= threshold ? (
          <span className="flex w-fit items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
            <AlertTriangle size={12} /> Low Stock
          </span>
        ) : (
          <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-700">In Stock</span>
        ),
    },
    {
      key: "actions",
      header: "Adjust Stock",
      render: (p) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            className="input-field w-20 !py-1.5"
            placeholder="Qty"
            value={amounts[p.id] ?? ""}
            onChange={(e) => setAmounts({ ...amounts, [p.id]: e.target.value })}
          />
          <button onClick={() => adjustStock(p.id, "add")} className="rounded-lg bg-forest-100 p-1.5 text-forest-700 hover:bg-forest-200" aria-label="Add stock">
            <Plus size={14} />
          </button>
          <button onClick={() => adjustStock(p.id, "reduce")} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100" aria-label="Reduce stock">
            <Minus size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setFilter("all")} className={`card p-4 text-center ${filter === "all" ? "ring-2 ring-forest-700" : ""}`}>
          <p className="font-display text-xl font-bold text-forest-800">{stats.total}</p>
          <p className="text-xs text-forest-500">All Products</p>
        </button>
        <button onClick={() => setFilter("low")} className={`card p-4 text-center ${filter === "low" ? "ring-2 ring-orange-500" : ""}`}>
          <p className="font-display text-xl font-bold text-orange-500">{stats.low}</p>
          <p className="text-xs text-forest-500">Low Stock</p>
        </button>
        <button onClick={() => setFilter("out")} className={`card p-4 text-center ${filter === "out" ? "ring-2 ring-red-500" : ""}`}>
          <p className="font-display text-xl font-bold text-red-500">{stats.out}</p>
          <p className="text-xs text-forest-500">Out of Stock</p>
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading inventory...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} emptyMessage="No products match this filter." />
      )}
    </div>
  );
}
