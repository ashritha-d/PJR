"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice: number | null;
  unit: string;
  availability: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: WishlistItem) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    if (status !== "loading") refresh();
  }, [status, refresh]);

  const isWishlisted = (productId: string) => items.some((i) => i.productId === productId);

  const toggleWishlist = async (product: WishlistItem) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to use your wishlist");
      return;
    }
    if (isWishlisted(product.productId)) {
      await fetch(`/api/wishlist?productId=${product.productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.productId !== product.productId));
      toast.success("Removed from wishlist");
    } else {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.productId }),
      });
      setItems((prev) => [...prev, product]);
      toast.success("Added to wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ items, loading, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
