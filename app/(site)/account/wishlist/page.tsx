"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { items, loading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  return (
    <div>
      <h1 className="section-heading">My Wishlist</h1>
      <p className="section-subheading">Products you&apos;ve saved for later.</p>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-64" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love so you can find them easily later."
            actionHref="/products"
            actionLabel="Browse Products"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.productId} className="card overflow-hidden">
                <Link href={`/products/${item.slug}`} className="relative block aspect-square bg-forest-50">
                  <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="200px" className="object-cover" />
                </Link>
                <div className="p-4">
                  <Link href={`/products/${item.slug}`} className="line-clamp-1 font-semibold text-forest-800 hover:text-forest-600">
                    {item.name}
                  </Link>
                  <p className="mt-1 font-semibold text-forest-800">
                    {formatCurrency(item.discountPrice ?? item.price)}{" "}
                    <span className="text-xs font-normal text-forest-400">/ {item.unit}</span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        addItem(
                          {
                            productId: item.productId,
                            name: item.name,
                            slug: item.slug,
                            image: item.image,
                            price: item.price,
                            discountPrice: item.discountPrice,
                            unit: item.unit,
                            stock: 99,
                            availability: item.availability,
                          },
                          1
                        )
                      }
                      className="btn-secondary flex-1 !py-2 !text-xs"
                    >
                      <ShoppingCart size={14} /> Add
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="rounded-full border-2 border-forest-200 p-2 text-red-500"
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={14} className="fill-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
