"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  MapPin,
  KeyRound,
  ShoppingCart,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/profile", label: "My Profile", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/account/change-password", label: "Change Password", icon: KeyRound },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card h-fit p-4 lg:sticky lg:top-24">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                active ? "bg-forest-700 text-cream-100" : "text-forest-600 hover:bg-forest-50"
              }`}
            >
              <link.icon size={16} /> {link.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>
    </aside>
  );
}
