"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice: number | null;
  unit: string;
  stock: number;
  availability: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const GUEST_CART_KEY = "pjr_guest_cart";

function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const merged = useRef(false);

  const fetchServerCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (status === "authenticated") {
        if (!merged.current) {
          const guestItems = readGuestCart();
          if (guestItems.length > 0) {
            await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              }),
            });
            window.localStorage.removeItem(GUEST_CART_KEY);
          }
          merged.current = true;
        }
        await fetchServerCart();
      } else if (status === "unauthenticated") {
        setItems(readGuestCart());
      }
      setLoading(false);
    }
    if (status !== "loading") init();
  }, [status, fetchServerCart]);

  const addItem: CartContextValue["addItem"] = async (product, quantity = 1) => {
    if (status === "authenticated") {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.productId, quantity }),
      });
      await fetchServerCart();
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.productId);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: Math.min(i.quantity + quantity, Math.max(product.stock, 1)) }
              : i
          );
        } else {
          next = [...prev, { ...product, quantity }];
        }
        writeGuestCart(next);
        return next;
      });
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    if (status === "authenticated") {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      await fetchServerCart();
    } else {
      setItems((prev) => {
        const next = prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
        writeGuestCart(next);
        return next;
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (status === "authenticated") {
      await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      await fetchServerCart();
    } else {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        writeGuestCart(next);
        return next;
      });
    }
    toast.success("Removed from cart");
  };

  const clearCart = async () => {
    if (status === "authenticated") {
      await fetch("/api/cart", { method: "DELETE" });
      setItems([]);
    } else {
      writeGuestCart([]);
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, loading, totalItems, subtotal, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
