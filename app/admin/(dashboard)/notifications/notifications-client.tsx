"use client";

import { useEffect, useState } from "react";
import { Bell, ShoppingBag, AlertTriangle, UserPlus, Star, Mail } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const ICONS: Record<string, typeof Bell> = {
  NEW_ORDER: ShoppingBag,
  LOW_STOCK: AlertTriangle,
  NEW_CUSTOMER: UserPlus,
  NEW_REVIEW: Star,
  NEW_MESSAGE: Mail,
};

export function NotificationsClient() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  if (loading) return <div className="skeleton h-96" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={markAllRead} className="btn-secondary !py-2 !text-xs">
          Mark All as Read
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-forest-400">No notifications yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <div key={n.id} className={`card flex items-start gap-4 p-4 ${!n.isRead ? "border-l-4 border-l-forest-700" : ""}`}>
                <div className="rounded-xl bg-forest-50 p-2.5 text-forest-600">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-forest-800">{n.title}</p>
                  <p className="text-sm text-forest-500">{n.message}</p>
                  <p className="mt-1 text-xs text-forest-400">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
