"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { addressSchema } from "@/lib/validations";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin } from "lucide-react";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setErrors({});
  }

  function openEdit(a: Address) {
    setForm({ ...a, line2: a.line2 ?? "" });
    setEditing(a.id);
    setShowForm(true);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(editing ? `/api/account/addresses/${editing}` : "/api/account/addresses", {
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
      setAddresses((prev) =>
        prev.map((a) => (a.id === editing ? data.address : parsed.data.isDefault ? { ...a, isDefault: false } : a))
      );
    } else {
      setAddresses((prev) => [data.address, ...(parsed.data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev)]);
    }
    toast.success(editing ? "Address updated" : "Address added");
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete address");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={openNew} className="btn-primary !py-2.5">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="mt-6">
          <EmptyState icon={MapPin} title="No saved addresses" description="Add an address to speed up checkout next time." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-forest-800">
                  {a.label} {a.isDefault && <Star size={14} className="fill-gold text-gold" />}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-forest-500 hover:text-forest-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-forest-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-forest-600">{a.fullName}</p>
              <p className="text-sm text-forest-500">
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}
              </p>
              <p className="text-xs text-forest-400">Phone: {a.phone}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl"
          >
            <h3 className="font-display text-lg font-bold text-forest-800">
              {editing ? "Edit Address" : "Add New Address"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label-field">Label</label>
                <input className="input-field" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home / Work / Other" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Full Name</label>
                  <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label-field">Phone</label>
                  <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="label-field">Address Line 1</label>
                <input className="input-field" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1}</p>}
              </div>
              <div>
                <label className="label-field">Address Line 2 (optional)</label>
                <input className="input-field" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label-field">City</label>
                  <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label className="label-field">State</label>
                  <input className="input-field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                </div>
                <div>
                  <label className="label-field">Pincode</label>
                  <input className="input-field" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                  {errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-forest-600">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-forest-700"
                />
                Set as default address
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
