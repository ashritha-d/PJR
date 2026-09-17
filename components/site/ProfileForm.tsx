"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { profileSchema } from "@/lib/validations";

export function ProfileForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [form, setForm] = useState({ name: initial.name, phone: initial.phone });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Profile updated successfully");
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
      <div>
        <label className="label-field">Full Name</label>
        <input
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>
      <div>
        <label className="label-field">Email Address</label>
        <input className="input-field bg-forest-50" value={initial.email} disabled />
        <p className="mt-1 text-xs text-forest-400">Email address cannot be changed.</p>
      </div>
      <div>
        <label className="label-field">Mobile Number</label>
        <input
          className="input-field"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading && <Loader2 size={16} className="animate-spin" />}
        Save Changes
      </button>
    </form>
  );
}
