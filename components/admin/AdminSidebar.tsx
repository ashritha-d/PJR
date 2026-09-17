"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ADMIN_NAV } from "./admin-nav";

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-72 flex-col bg-forest-900 text-cream-200">
      <div className="flex items-center justify-between gap-2 px-5 py-6">
        <div className="flex items-center gap-2">
          <Image
            src="/brand/logo-emblem.jpg"
            alt="PJR Farm"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-sm font-bold text-cream-100">PJR Farm Admin</p>
            <p className="text-[11px] text-forest-400">Management Dashboard</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {ADMIN_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "bg-forest-700 text-cream-100" : "text-forest-300 hover:bg-forest-800 hover:text-cream-100"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
