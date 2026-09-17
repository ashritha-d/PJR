"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { couponSchema } from "@/lib/validations";
import { formatCurrency, formatDate } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: string;
};

const emptyForm = {
  code: "",
  discountType: "PERCENT" as "PERCENT" | "FLAT",
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscount: "",
  startDate: new Date().toISOString().slice(0, 10),
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  usageLimit: 0,
  status: "ACTIVE" as "ACTIVE" | "INACTIVE",
};

export function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setErrors({});
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      discountType: c.discountType as "PERCENT" | "FLAT",
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      startDate: c.startDate.slice(0, 10),
      expiryDate: c.expiryDate.slice(0, 10),
      usageLimit: c.usageLimit,
      status: c.status as "ACTIVE" | "INACTIVE",
    });
    setEditing(c);
    setShowForm(true);
    setErrors({});
  }

  async function toggleStatus(c: Coupon) {
    const newStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: newStatus } : x)));
    toast.success(`Coupon ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: Number(form.usageLimit),
    };
    const parsed = couponSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    const res = await fetch(editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    await load();
    toast.success(editing ? "Coupon updated" : "Coupon created");
    setShowForm(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Coupon deleted");
    setDeleteTarget(null);
  }

  const columns: Column<Coupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-semibold text-forest-800">{c.code}</span> },
    {
      key: "discount",
      header: "Discount",
      render: (c) => (c.discountType === "PERCENT" ? `${c.discountValue}%` : formatCurrency(c.discountValue)),
    },
    { key: "min", header: "Min Order", render: (c) => formatCurrency(c.minOrderAmount) },
    { key: "usage", header: "Usage", render: (c) => `${c.usedCount}${c.usageLimit > 0 ? ` / ${c.usageLimit}` : ""}` },
    { key: "validity", header: "Validity", render: (c) => `${formatDate(c.startDate)} - ${formatDate(c.expiryDate)}` },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <button
          onClick={() => toggleStatus(c)}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === "ACTIVE" ? "bg-forest-100 text-forest-700" : "bg-forest-50 text-forest-400"}`}
        >
          {c.status === "ACTIVE" ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 hover:text-forest-800">
            <Pencil size={16} />
          </button>
          <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-forest-500 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary !py-2.5">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {loading ? <div className="card p-10 text-center text-sm text-forest-400">Loading coupons...</div> : <DataTable columns={columns} rows={coupons} emptyMessage="No coupons yet." />}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Coupon Code</label>
            <input className="input-field font-mono uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Discount Type</label>
              <select className="input-field" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENT" | "FLAT" })}>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label-field">Discount Value</label>
              <input type="number" className="input-field" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
              {errors.discountValue && <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>}
            </div>
            <div>
              <label className="label-field">Minimum Order Amount (₹)</label>
              <input type="number" className="input-field" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label-field">Maximum Discount (₹, optional)</label>
              <input type="number" className="input-field" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Expiry Date</label>
              <input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
            </div>
            <div>
              <label className="label-field">Usage Limit (0 = unlimited)</label>
              <input type="number" className="input-field" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-forest-600">
            <input type="checkbox" className="accent-forest-700" checked={form.status === "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "ACTIVE" : "INACTIVE" })} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete this coupon?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
