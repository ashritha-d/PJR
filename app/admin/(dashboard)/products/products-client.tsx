"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  unit: string;
  status: string;
  isFeatured: boolean;
  category: { name: string };
  images: { url: string }[];
};

type Category = { id: string; name: string };

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);

    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`/api/admin/products?${params.toString()}`),
      fetch("/api/admin/categories"),
    ]);
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    setProducts(productsData.items ?? []);
    setCategories(categoriesData.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryFilter, statusFilter]);

  async function toggleStatus(product: Product) {
    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p)));
    toast.success(`Product ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete product");
      setDeleteTarget(null);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success("Product deleted");
    setDeleteTarget(null);
  }

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
            <p className="flex items-center gap-1 font-medium text-forest-800">
              {p.name} {p.isFeatured && <Star size={12} className="fill-gold text-gold" />}
            </p>
            <p className="text-xs text-forest-400">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => p.category.name },
    {
      key: "price",
      header: "Price",
      render: (p) => (
        <span>
          {formatCurrency(p.discountPrice ?? p.price)}
          {p.discountPrice != null && <span className="ml-1 text-xs text-forest-400 line-through">{formatCurrency(p.price)}</span>}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <span className={p.stock <= 10 ? "font-semibold text-orange-500" : ""}>
          {p.stock} {p.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <button
          onClick={() => toggleStatus(p)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            p.status === "ACTIVE" ? "bg-forest-100 text-forest-700" : "bg-forest-50 text-forest-400"
          }`}
        >
          {p.status === "ACTIVE" ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${p.id}/edit`} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 hover:text-forest-800">
            <Pencil size={16} />
          </Link>
          <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-forest-500 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input className="input-field pl-9" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <Link href="/admin/products/new" className="btn-primary !py-2.5">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading products...</div>
      ) : (
        <DataTable columns={columns} rows={products} emptyMessage="No products found." />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
