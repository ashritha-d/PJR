"use client";

import { ProductCard } from "@/components/site/ProductCard";
import { HorizontalSlider } from "@/components/site/HorizontalSlider";
import type { ProductCardData } from "@/lib/types";

export function ProductSlider({ products }: { products: ProductCardData[] }) {
  return (
    <HorizontalSlider
      items={products}
      ariaLabel="products"
      itemClassName="w-[190px] sm:w-[220px] lg:w-[240px]"
      renderItem={(product) => <ProductCard product={product} />}
    />
  );
}
