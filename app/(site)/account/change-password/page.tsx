"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(form);
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
    toast.success("Password changed successfully");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <div>
      <h1 className="section-heading">Change Password</h1>
      <p className="section-subheading">Keep your account secure with a strong password.</p>

      <form onSubmit={handleSubmit} className="card mt-8 max-w-lg space-y-4 p-6">
        <div>
          <label className="label-field">Current Password</label>
          <input
            type="password"
            className="input-field"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>}
        </div>
        <div>
          <label className="label-field">New Password</label>
          <input
            type="password"
            className="input-field"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
        </div>
        <div>
          <label className="label-field">Confirm New Password</label>
          <input
            type="password"
            className="input-field"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
