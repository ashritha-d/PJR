"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { settingsSchema } from "@/lib/validations";

type Settings = {
  businessName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
  socialLinks: { facebook: string; instagram: string; youtube: string; twitter: string };
  deliveryChargeFlat: number;
  freeDeliveryThreshold: number;
  taxPercent: number;
  lowStockThreshold: number;
  currency: string;
};

export function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!settings) return;
    const parsed = settingsSchema.safeParse(settings);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save settings");
      return;
    }
    toast.success("Settings updated successfully");
  }

  if (loading || !settings) return <div className="skeleton h-96" />;

  return (
    <div className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          Please check: {Object.values(errors).join(" · ")}
        </div>
      )}

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Business Identity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Business Name</label>
            <input className="input-field" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Tagline</label>
            <input className="input-field" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploader value={settings.logoUrl} onChange={(url) => setSettings({ ...settings, logoUrl: url })} folder="settings" label="Logo" />
          <ImageUploader value={settings.faviconUrl} onChange={(url) => setSettings({ ...settings, faviconUrl: url })} folder="settings" label="Favicon" />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Phone</label>
            <input className="input-field" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          </div>
          <div>
            <label className="label-field">WhatsApp Number</label>
            <input className="input-field" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input className="input-field" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Working Hours</label>
            <input className="input-field" value={settings.workingHours} onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label-field">Business Address</label>
          <textarea className="input-field" rows={2} value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Google Maps Embed URL (optional)</label>
          <input className="input-field" value={settings.mapEmbedUrl} onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Social Media Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "youtube", "twitter"] as const).map((key) => (
            <div key={key}>
              <label className="label-field capitalize">{key}</label>
              <input
                className="input-field"
                value={settings.socialLinks[key]}
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [key]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Delivery, Tax &amp; Inventory Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-field">Delivery Charge (₹)</label>
            <input type="number" className="input-field" value={settings.deliveryChargeFlat} onChange={(e) => setSettings({ ...settings, deliveryChargeFlat: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label-field">Free Delivery Above (₹)</label>
            <input type="number" className="input-field" value={settings.freeDeliveryThreshold} onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label-field">Tax Percent (%)</label>
            <input type="number" className="input-field" value={settings.taxPercent} onChange={(e) => setSettings({ ...settings, taxPercent: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label-field">Low Stock Threshold</label>
            <input type="number" className="input-field" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })} />
          </div>
        </div>
        <div className="max-w-xs">
          <label className="label-field">Currency</label>
          <input className="input-field" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
