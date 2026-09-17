"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { AdminSidebar } from "./AdminSidebar";
import { getAdminTitle } from "./admin-nav";

export function AdminTopbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getAdminTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-forest-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-forest-700 hover:bg-forest-50 lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <h1 className="font-display text-lg font-bold text-forest-800 sm:text-xl">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="hidden items-center gap-2 border-l border-forest-100 pl-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-forest-800">{session?.user?.name}</p>
              <p className="text-xs text-forest-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="rounded-full p-2.5 text-forest-600 hover:bg-red-50 hover:text-red-500"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
