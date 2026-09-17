"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/ui/StarRating";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { formatCurrency, cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();

  const outOfStock = product.availability === "OUT_OF_STOCK" || product.stock <= 0;
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:shadow-soft">
      <button
        onClick={() =>
          toggleWishlist({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            discountPrice: product.discountPrice,
            unit: product.unit,
            availability: product.availability,
          })
        }
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-card transition hover:scale-110"
      >
        <Heart
          size={16}
          className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-forest-600"}
        />
      </button>

      {hasDiscount && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-forest-900">
          SAVE {formatCurrency(product.price - (product.discountPrice ?? 0))}
        </span>
      )}

      <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-forest-50">
        <Image
          src={product.image || "/placeholders/vegetables.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-forest-800">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-gold-dark">
          {product.categoryName}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 font-display font-semibold text-forest-800 hover:text-forest-600">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-xs text-forest-500">{product.description}</p>
        <StarRating rating={product.ratingAvg} count={product.ratingCount} />

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-forest-800">
            {formatCurrency(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-forest-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
          <span className="text-xs text-forest-500">/ {product.unit}</span>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            disabled={outOfStock}
            onClick={() =>
              addItem(
                {
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: product.image,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  unit: product.unit,
                  stock: product.stock,
                  availability: product.availability,
                },
                1
              )
            }
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-forest-700 px-3 py-2 text-xs font-semibold text-forest-700 transition hover:bg-forest-700 hover:text-cream-100",
              outOfStock && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-forest-700"
            )}
          >
            <ShoppingCart size={14} /> Add
          </button>
          <button
            disabled={outOfStock}
            onClick={async () => {
              await addItem(
                {
                  productId: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: product.image,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  unit: product.unit,
                  stock: product.stock,
                  availability: product.availability,
                },
                1
              );
              router.push("/checkout");
            }}
            className={cn(
              "flex-1 rounded-full bg-forest-700 px-3 py-2 text-xs font-semibold text-cream-100 transition hover:bg-forest-800",
              outOfStock && "cursor-not-allowed opacity-40 hover:bg-forest-700"
            )}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
