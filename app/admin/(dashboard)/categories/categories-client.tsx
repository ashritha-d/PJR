"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { categorySchema } from "@/lib/validations";

type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  status: string;
  displayOrder: number;
  _count: { products: number };
};

const emptyForm = { name: "", description: "", image: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE", displayOrder: 0 };

export function CategoriesClient({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    setCategories(initial);
  }, [initial]);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setErrors({});
  }

  function openEdit(c: Category) {
    setForm({ name: c.name, description: c.description, image: c.image, status: c.status as "ACTIVE" | "INACTIVE", displayOrder: c.displayOrder });
    setEditing(c);
    setShowForm(true);
    setErrors({});
  }

  async function toggleStatus(c: Category) {
    const newStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setCategories((prev) => prev.map((cat) => (cat.id === c.id ? { ...cat, status: newStatus } : cat)));
    toast.success(`Category ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = categorySchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    if (editing) {
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data.category } : c)));
      toast.success("Category updated");
    } else {
      setCategories((prev) => [...prev, { ...data.category, _count: { products: 0 } }]);
      toast.success("Category created");
    }
    setShowForm(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete category");
      setDeleteTarget(null);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Category deleted");
    setDeleteTarget(null);
  }

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-forest-50">
            <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />
          </div>
          <span className="font-medium text-forest-800">{c.name}</span>
        </div>
      ),
    },
    { key: "products", header: "Products", render: (c) => c._count.products },
    { key: "order", header: "Order", render: (c) => c.displayOrder },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <button
          onClick={() => toggleStatus(c)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            c.status === "ACTIVE" ? "bg-forest-100 text-forest-700" : "bg-forest-50 text-forest-400"
          }`}
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
          <Plus size={16} /> Add Category
        </button>
      </div>

      <DataTable columns={columns} rows={categories} emptyMessage="No categories yet." />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Category Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>
          <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="categories" />
          {errors.image && <p className="text-xs text-red-600">{errors.image}</p>}
          <div>
            <label className="label-field">Display Order</label>
            <input type="number" className="input-field" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-forest-600">
            <input type="checkbox" className="accent-forest-700" checked={form.status === "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "ACTIVE" : "INACTIVE" })} />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
