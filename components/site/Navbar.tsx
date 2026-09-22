"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, Heart, User, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";

type Category = { name: string; slug: string };

export function Navbar({
  businessName,
  categories,
}: {
  businessName: string;
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { status } = useSession();
  const { totalItems } = useCart();
  const pathname = usePathname();

  const loggedIn = status === "authenticated";

  const guestLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Products" },
    { href: "/our-farming", label: "Our Farming" },
    { href: "/contact", label: "Contact" },
  ];

  const userLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/account/orders", label: "My Orders" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account", label: "Profile" },
  ];

  const links = loggedIn ? userLinks : guestLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-forest-100 bg-cream-100/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/brand/logo-horizontal.jpg"
            alt={businessName}
            width={220}
            height={56}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-forest-700 text-cream-100"
                  : "text-forest-700 hover:bg-forest-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              onBlur={() => setTimeout(() => setCategoriesOpen(false), 150)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-forest-700 hover:bg-forest-50"
            >
              Categories <ChevronDown size={16} />
            </button>
            {categoriesOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-forest-100 bg-white p-2 shadow-soft">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    className="block rounded-xl px-3 py-2 text-sm text-forest-700 hover:bg-forest-50"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-full p-2.5 text-forest-700 hover:bg-forest-50"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-forest-900">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {loggedIn ? (
            <>
              <Link
                href="/account/wishlist"
                className="hidden rounded-full p-2.5 text-forest-700 hover:bg-forest-50 sm:block"
                aria-label="Wishlist"
              >
                <Heart size={22} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-forest-700 hover:bg-forest-50 lg:flex"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden lg:block">
              <span className="btn-primary">
                <User size={16} /> Login
              </span>
            </Link>
          )}

          <button
            className="rounded-full p-2.5 text-forest-700 hover:bg-forest-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-forest-100 bg-cream-100 lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-forest-700 hover:bg-forest-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/categories"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-forest-700 hover:bg-forest-50"
            >
              Categories
            </Link>
            {loggedIn ? (
              <>
                <Link
                  href="/account/wishlist"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-forest-700 hover:bg-forest-50"
                >
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-forest-700 hover:bg-forest-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-forest-700 hover:bg-forest-50"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
