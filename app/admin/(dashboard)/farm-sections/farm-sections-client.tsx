"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { farmSectionSchema } from "@/lib/validations";

type FarmSection = {
  id: string;
  key: string;
  title: string;
  description: string;
  image: string;
  displayOrder: number;
};

const emptyForm = { key: "", title: "", description: "", image: "", displayOrder: 0 };

export function FarmSectionsClient({ initial }: { initial: FarmSection[] }) {
  const [sections, setSections] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FarmSection | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FarmSection | null>(null);

  useEffect(() => setSections(initial), [initial]);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setErrors({});
  }

  function openEdit(s: FarmSection) {
    setForm(s);
    setEditing(s);
    setShowForm(true);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = farmSectionSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(editing ? `/api/admin/farm-sections/${editing.id}` : "/api/admin/farm-sections", {
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
      setSections((prev) => prev.map((s) => (s.id === editing.id ? data.section : s)));
      toast.success("Farm section updated");
    } else {
      setSections((prev) => [...prev, data.section]);
      toast.success("Farm section created");
    }
    setShowForm(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/farm-sections/${deleteTarget.id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success("Farm section deleted");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary !py-2.5">
          <Plus size={16} /> Add Farm Section
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((s) => (
            <div key={s.id} className="card overflow-hidden">
              <div className="relative aspect-video bg-forest-50">
                <Image src={s.image} alt={s.title} fill sizes="300px" className="object-cover" />
              </div>
              <div className="p-4">
                <p className="font-display font-semibold text-forest-800">{s.title}</p>
                <p className="line-clamp-2 text-xs text-forest-500">{s.description}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 hover:text-forest-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(s)} className="rounded-lg p-1.5 text-forest-500 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Farm Section" : "Add Farm Section"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>
          <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="farm-sections" />
          {errors.image && <p className="text-xs text-red-600">{errors.image}</p>}
          <div>
            <label className="label-field">Display Order</label>
            <input type="number" className="input-field" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete this farm section?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
