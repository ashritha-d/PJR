"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    setItems(data.items ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="relative rounded-full p-2.5 text-forest-600 hover:bg-forest-50"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-forest-100 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-forest-100 p-4">
            <span className="font-semibold text-forest-800">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-forest-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-forest-400">No notifications yet</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={`border-b border-forest-50 p-4 ${!n.isRead ? "bg-forest-50/50" : ""}`}>
                  <p className="text-sm font-medium text-forest-800">{n.title}</p>
                  <p className="mt-0.5 text-xs text-forest-500">{n.message}</p>
                  <p className="mt-1 text-[11px] text-forest-400">{formatDateTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
