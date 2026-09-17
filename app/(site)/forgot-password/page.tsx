"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, MailCheck } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success("If that email exists, a reset link has been generated.");
    setDevResetUrl(data.devResetUrl ?? null);
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
          <h1 className="mt-4 font-display text-2xl font-bold text-forest-800">Forgot Password</h1>
          <p className="mt-1 text-sm text-forest-500">
            Enter your registered email and we&apos;ll help you reset your password.
          </p>
        </div>

        {devResetUrl ? (
          <div className="mt-8 rounded-2xl bg-forest-50 p-5 text-center">
            <MailCheck className="mx-auto mb-2 text-forest-600" size={32} />
            <p className="text-sm text-forest-600">
              Email delivery isn&apos;t connected yet in this environment, so here&apos;s your reset link directly:
            </p>
            <Link href={devResetUrl} className="btn-primary mt-4 inline-flex">
              Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label-field">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-forest-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-forest-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
