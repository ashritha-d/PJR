"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { bannerSchema } from "@/lib/validations";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  buttonText: string | null;
  buttonLink: string | null;
  displayOrder: number;
  status: string;
};

const emptyForm = { title: "", subtitle: "", image: "", buttonText: "", buttonLink: "", displayOrder: 0, status: "ACTIVE" as "ACTIVE" | "INACTIVE" };

export function BannersClient({ initial }: { initial: Banner[] }) {
  const [banners, setBanners] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  useEffect(() => setBanners(initial), [initial]);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setErrors({});
  }

  function openEdit(b: Banner) {
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      buttonText: b.buttonText ?? "",
      buttonLink: b.buttonLink ?? "",
      displayOrder: b.displayOrder,
      status: b.status as "ACTIVE" | "INACTIVE",
    });
    setEditing(b);
    setShowForm(true);
    setErrors({});
  }

  async function toggleStatus(b: Banner) {
    const newStatus = b.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBanners((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: newStatus } : x)));
    toast.success(`Banner ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
  }

  async function moveOrder(b: Banner, direction: "up" | "down") {
    const sorted = [...banners].sort((a, c) => a.displayOrder - c.displayOrder);
    const idx = sorted.findIndex((x) => x.id === b.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const c = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/banners/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayOrder: c.displayOrder }) }),
      fetch(`/api/admin/banners/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayOrder: a.displayOrder }) }),
    ]);
    setBanners((prev) =>
      prev.map((x) => {
        if (x.id === a.id) return { ...x, displayOrder: c.displayOrder };
        if (x.id === c.id) return { ...x, displayOrder: a.displayOrder };
        return x;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = bannerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners", {
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
      setBanners((prev) => prev.map((b) => (b.id === editing.id ? data.banner : b)));
      toast.success("Banner updated");
    } else {
      setBanners((prev) => [...prev, data.banner]);
      toast.success("Banner created");
    }
    setShowForm(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    toast.success("Banner deleted");
    setDeleteTarget(null);
  }

  const sorted = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary !py-2.5">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((b, i) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="relative aspect-[16/7] bg-forest-50">
              <Image src={b.image} alt={b.title} fill sizes="400px" className="object-cover" />
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.status === "ACTIVE" ? "bg-forest-700 text-cream-100" : "bg-white/80 text-forest-500"}`}>
                {b.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="p-4">
              <p className="font-display font-semibold text-forest-800">{b.title}</p>
              <p className="line-clamp-1 text-xs text-forest-500">{b.subtitle}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <button onClick={() => moveOrder(b, "up")} disabled={i === 0} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 disabled:opacity-30">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveOrder(b, "down")} disabled={i === sorted.length - 1} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 disabled:opacity-30">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => toggleStatus(b)} className="rounded-lg px-2 py-1 text-xs font-medium text-forest-500 hover:bg-forest-50">
                    Toggle
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 hover:text-forest-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(b)} className="rounded-lg p-1.5 text-forest-500 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Banner" : "Add Banner"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="label-field">Subtitle</label>
            <textarea className="input-field" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="banners" />
          {errors.image && <p className="text-xs text-red-600">{errors.image}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Button Text</label>
              <input className="input-field" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
            </div>
            <div>
              <label className="label-field">Button Link</label>
              <input className="input-field" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} placeholder="/products" />
            </div>
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
        title="Delete this banner?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
