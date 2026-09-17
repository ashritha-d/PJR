"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { loginSchema } from "@/lib/validations";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      toast.error(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      return;
    }

    const session = await getSession();
    setLoading(false);

    if (session?.user?.role !== "ADMIN") {
      toast.error("This login is for administrators only.");
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
      return;
    }

    toast.success("Welcome back, Admin!");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-900 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-stacked.jpg"
            alt="PJR Farm & Agro Products"
            width={90}
            height={90}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <span className="mt-4 flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
            <ShieldCheck size={14} /> Admin Dashboard
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-forest-800">Admin Login</h1>
          <p className="mt-1 text-sm text-forest-500">Restricted access for authorized administrators.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label-field">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Login to Dashboard
          </button>
        </form>

        <p className="mt-6 rounded-xl bg-forest-50 p-3 text-center text-xs text-forest-500">
          Demo admin login: <strong>admin@pjrfarm.com</strong> / <strong>Admin@123</strong>
        </p>
      </div>
    </div>
  );
}
