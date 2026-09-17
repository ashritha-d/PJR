"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { cn } from "@/lib/utils";

export function ProductActions({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    discountPrice: number | null;
    unit: string;
    stock: number;
    availability: string;
  };
}) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();

  const outOfStock = product.availability === "OUT_OF_STOCK" || product.stock <= 0;
  const maxQty = Math.max(product.stock, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-forest-700">Quantity</span>
        <div className="flex items-center rounded-full border border-forest-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 text-forest-600 hover:text-forest-900"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))}
            className="p-2.5 text-forest-600 hover:text-forest-900"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-xs text-forest-400">{product.unit} each</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
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
              qty
            )
          }
          className={cn("btn-secondary flex-1", outOfStock && "cursor-not-allowed opacity-40")}
        >
          <ShoppingCart size={18} /> Add to Cart
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
              qty
            );
            router.push("/checkout");
          }}
          className={cn("btn-primary flex-1", outOfStock && "cursor-not-allowed opacity-40")}
        >
          Buy Now
        </button>
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
          className="flex items-center justify-center rounded-full border-2 border-forest-200 p-3.5 text-forest-600 hover:border-red-300 hover:text-red-500"
          aria-label="Toggle wishlist"
        >
          <Heart size={20} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      {outOfStock && <p className="text-sm font-medium text-red-600">Currently out of stock.</p>}
    </div>
  );
}
