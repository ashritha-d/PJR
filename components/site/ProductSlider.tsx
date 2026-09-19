"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/types";

export function ProductSlider({ products }: { products: ProductCardData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  function scroll(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 240);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll to previous products"
        disabled={!canScrollLeft}
        className={cn(
          "absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-forest-700 shadow-soft transition sm:flex",
          !canScrollLeft && "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollerRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[190px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Scroll to next products"
        disabled={!canScrollRight}
        className={cn(
          "absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white p-2.5 text-forest-700 shadow-soft transition sm:flex",
          !canScrollRight && "pointer-events-none opacity-0"
        )}
      >
        <ChevronRight size={20} />
      </button>

      <div className="mt-3 flex justify-center gap-3 sm:hidden">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll to previous products"
          disabled={!canScrollLeft}
          className="rounded-full border-2 border-forest-200 p-2 text-forest-700 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll to next products"
          disabled={!canScrollRight}
          className="rounded-full border-2 border-forest-200 p-2 text-forest-700 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
