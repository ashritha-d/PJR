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

export function ProductCard({
  product,
  compact = false,
}: {
  product: ProductCardData;
  compact?: boolean;
}) {
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
        className={cn(
          "absolute z-10 rounded-full bg-white/90 shadow-card transition hover:scale-110",
          compact ? "right-1.5 top-1.5 p-1.5" : "right-3 top-3 p-2"
        )}
      >
        <Heart
          size={compact ? 12 : 16}
          className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-forest-600"}
        />
      </button>

      {hasDiscount && (
        <span
          className={cn(
            "absolute z-10 rounded-full bg-gold font-bold text-forest-900",
            compact ? "left-1.5 top-1.5 px-1.5 py-0.5 text-[9px]" : "left-3 top-3 px-2.5 py-1 text-[11px]"
          )}
        >
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

      <div className={cn("flex flex-1 flex-col", compact ? "gap-0.5 p-2.5" : "gap-1.5 p-4")}>
        <span className={cn("font-medium uppercase tracking-wide text-gold-dark", compact ? "text-[10px]" : "text-xs")}>
          {product.categoryName}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3 className={cn("line-clamp-1 font-display font-semibold text-forest-800 hover:text-forest-600", compact && "text-sm")}>
            {product.name}
          </h3>
        </Link>
        {!compact && <p className="line-clamp-2 text-xs text-forest-500">{product.description}</p>}
        <StarRating rating={product.ratingAvg} count={compact ? undefined : product.ratingCount} size={compact ? 10 : 14} />

        <div className={cn("flex items-baseline gap-1.5", compact ? "mt-0.5" : "mt-1 gap-2")}>
          <span className={cn("font-display font-bold text-forest-800", compact ? "text-sm" : "text-lg")}>
            {formatCurrency(price)}
          </span>
          {hasDiscount && !compact && (
            <span className="text-sm text-forest-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
          {!compact && <span className="text-xs text-forest-500">/ {product.unit}</span>}
        </div>

        <div className={cn("flex gap-2", compact ? "mt-1" : "mt-2")}>
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
              "flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-forest-700 font-semibold text-forest-700 transition hover:bg-forest-700 hover:text-cream-100",
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-xs",
              outOfStock && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-forest-700"
            )}
          >
            <ShoppingCart size={compact ? 11 : 14} /> Add
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
              "flex-1 rounded-full bg-forest-700 font-semibold text-cream-100 transition hover:bg-forest-800",
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-xs",
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
