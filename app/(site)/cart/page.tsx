"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { usePublicSettings } from "@/lib/use-public-settings";
import { calculateOrderTotals } from "@/lib/order-math";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();
  const { settings } = usePublicSettings();

  const { deliveryCharge, tax, grandTotal } = calculateOrderTotals({
    subtotal,
    deliveryChargeFlat: settings.deliveryChargeFlat,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    taxPercent: settings.taxPercent,
  });

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="skeleton mx-auto h-64 max-w-3xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our fresh farm products."
          actionHref="/products"
          actionLabel="Shop Fresh Products"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="section-heading">Your Cart</h1>
      <p className="section-subheading">{items.length} item{items.length === 1 ? "" : "s"} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => {
            const price = item.discountPrice ?? item.price;
            return (
              <div key={item.productId} className="card flex items-center gap-4 p-4">
                <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-forest-50">
                  <Image src={item.image || "/placeholders/vegetables.svg"} alt={item.name} fill sizes="80px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="line-clamp-1 font-display font-semibold text-forest-800 hover:text-forest-600">
                    {item.name}
                  </Link>
                  <p className="text-xs text-forest-500">{item.unit}</p>
                  <p className="mt-1 font-semibold text-forest-800">{formatCurrency(price)}</p>
                </div>
                <div className="flex items-center rounded-full border border-forest-200">
                  <button
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    className="p-2 text-forest-600 hover:text-forest-900"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, Math.min(item.stock || 99, item.quantity + 1))}
                    className="p-2 text-forest-600 hover:text-forest-900"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="hidden w-24 text-right font-semibold text-forest-800 sm:block">
                  {formatCurrency(price * item.quantity)}
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full p-2 text-forest-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <Link href="/products" className="inline-block text-sm font-semibold text-forest-700 hover:underline">
            ← Continue Shopping
          </Link>
        </div>

        <div className="card h-fit p-6">
          <h3 className="font-display text-lg font-bold text-forest-800">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-forest-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{deliveryCharge === 0 ? "FREE" : formatCurrency(deliveryCharge)}</span>
            </div>
            {settings.taxPercent > 0 && (
              <div className="flex justify-between">
                <span>Tax ({settings.taxPercent}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            {deliveryCharge > 0 && (
              <p className="text-xs text-gold-dark">
                Add {formatCurrency(settings.freeDeliveryThreshold - subtotal)} more for free delivery!
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-forest-100 pt-4 font-display text-lg font-bold text-forest-800">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
