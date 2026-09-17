"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { contactSchema } from "@/lib/validations";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Your message has been submitted");
    setSent(true);
    setForm({ name: "", mobile: "", email: "", subject: "", message: "" });
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <Send className="mx-auto mb-3 text-forest-600" size={32} />
        <h3 className="font-display text-lg font-bold text-forest-800">Message Sent!</h3>
        <p className="mt-2 text-sm text-forest-500">
          Thank you for reaching out. Our team will get back to you shortly.
        </p>
        <button onClick={() => setSent(false)} className="btn-secondary mt-6">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Name</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label-field">Mobile Number</label>
          <input className="input-field" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
        </div>
      </div>
      <div>
        <label className="label-field">Email Address</label>
        <input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label className="label-field">Subject</label>
        <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
      </div>
      <div>
        <label className="label-field">Message</label>
        <textarea className="input-field" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Loader2 size={16} className="animate-spin" />}
        Send Message
      </button>
    </form>
  );
}
