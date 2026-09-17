"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { loginSchema } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

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

    setLoading(false);

    if (res?.error) {
      toast.error(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      return;
    }

    toast.success("Welcome back!");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-stacked.jpg"
            alt="PJR Farm & Agro Products"
            width={90}
            height={90}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <h1 className="mt-4 font-display text-2xl font-bold text-forest-800">Welcome Back</h1>
          <p className="mt-1 text-sm text-forest-500">Login to continue shopping fresh from PJR Farm.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label-field">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label-field">Password</label>
              <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-forest-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-500">
          New to PJR Farm?{" "}
          <Link href="/register" className="font-semibold text-forest-700 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-4 rounded-xl bg-forest-50 p-3 text-center text-xs text-forest-500">
          Demo customer login: <strong>customer@pjrfarm.com</strong> / <strong>Customer@123</strong>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
