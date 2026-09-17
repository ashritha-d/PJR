"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { profileSchema, changePasswordSchema } from "@/lib/validations";

export function AdminProfileClient() {
  const [profile, setProfile] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.user);
        setLoading(false);
      });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setProfileErrors(fieldErrors);
      return;
    }
    setProfileErrors({});
    setSavingProfile(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setSavingProfile(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Profile updated");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(passwordForm);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setPasswordErrors(fieldErrors);
      return;
    }
    setPasswordErrors({});
    setSavingPassword(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Password changed successfully");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  if (loading || !profile) return <div className="skeleton h-72" />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Profile Information</h3>
        <div>
          <label className="label-field">Full Name</label>
          <input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          {profileErrors.name && <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p>}
        </div>
        <div>
          <label className="label-field">Email</label>
          <input className="input-field bg-forest-50" value={profile.email} disabled />
        </div>
        <div>
          <label className="label-field">Mobile Number</label>
          <input className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          {profileErrors.phone && <p className="mt-1 text-xs text-red-600">{profileErrors.phone}</p>}
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile && <Loader2 size={16} className="animate-spin" />}
          Save Changes
        </button>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Change Password</h3>
        <div>
          <label className="label-field">Current Password</label>
          <input type="password" className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>}
        </div>
        <div>
          <label className="label-field">New Password</label>
          <input type="password" className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>}
        </div>
        <div>
          <label className="label-field">Confirm New Password</label>
          <input type="password" className="input-field" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
          {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>}
        </div>
        <button type="submit" disabled={savingPassword} className="btn-primary">
          {savingPassword && <Loader2 size={16} className="animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
