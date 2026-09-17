"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1F3319",
                color: "#FBF7EE",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#D4A017", secondary: "#FBF7EE" } },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
