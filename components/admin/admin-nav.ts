import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Boxes,
  CreditCard,
  Star,
  Image as ImageIcon,
  Home,
  Sprout,
  Ticket,
  Bell,
  Mail,
  BarChart3,
  Settings,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/homepage", label: "Homepage Content", icon: Home },
  { href: "/admin/farm-sections", label: "Farm Sections", icon: Sprout },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Admin Profile", icon: UserCog },
];

export function getAdminTitle(pathname: string): string {
  const sorted = [...ADMIN_NAV].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)));
  return match?.label ?? "Dashboard";
}
