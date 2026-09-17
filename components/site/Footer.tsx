import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail } from "lucide-react";

type Category = { name: string; slug: string };

export function Footer({
  businessName,
  tagline,
  phone,
  email,
  address,
  categories,
  socialLinks,
}: {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  categories: Category[];
  socialLinks: { facebook?: string; instagram?: string; youtube?: string; twitter?: string };
}) {
  return (
    <footer className="mt-20 border-t border-forest-100 bg-forest-900 text-cream-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Image
            src="/brand/logo-stacked.jpg"
            alt={businessName}
            width={140}
            height={140}
            className="h-24 w-24 rounded-2xl object-cover bg-white p-1"
          />
          <p className="mt-4 font-display text-lg italic text-gold-light">&ldquo;{tagline}&rdquo;</p>
          <div className="mt-4 flex gap-3">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="rounded-full bg-forest-800 p-2 hover:bg-forest-700">
                <Facebook size={18} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-forest-800 p-2 hover:bg-forest-700">
                <Instagram size={18} />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="rounded-full bg-forest-800 p-2 hover:bg-forest-700">
                <Youtube size={18} />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="rounded-full bg-forest-800 p-2 hover:bg-forest-700">
                <Twitter size={18} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gold-light">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-300">
            <li><Link href="/" className="hover:text-cream-100">Home</Link></li>
            <li><Link href="/about" className="hover:text-cream-100">About Us</Link></li>
            <li><Link href="/products" className="hover:text-cream-100">Products</Link></li>
            <li><Link href="/our-farming" className="hover:text-cream-100">Our Farming</Link></li>
            <li><Link href="/contact" className="hover:text-cream-100">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gold-light">Customer</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-300">
            <li><Link href="/account" className="hover:text-cream-100">My Account</Link></li>
            <li><Link href="/account/orders" className="hover:text-cream-100">My Orders</Link></li>
            <li><Link href="/account/wishlist" className="hover:text-cream-100">Wishlist</Link></li>
            <li><Link href="/cart" className="hover:text-cream-100">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gold-light">Categories</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-300">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover:text-cream-100">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-4 border-t border-forest-800 py-6 text-sm text-cream-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span className="flex items-center gap-2"><MapPin size={16} /> {address}</span>
          <span className="flex items-center gap-2"><Phone size={16} /> {phone}</span>
          <span className="flex items-center gap-2"><Mail size={16} /> {email}</span>
        </div>
        <p>© {new Date().getFullYear()} {businessName}. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
