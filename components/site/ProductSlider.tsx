"use client";

import { ProductCard } from "@/components/site/ProductCard";
import { HorizontalSlider } from "@/components/site/HorizontalSlider";
import type { ProductCardData } from "@/lib/types";

export function ProductSlider({ products }: { products: ProductCardData[] }) {
  return (
    <HorizontalSlider
      items={products}
      ariaLabel="products"
      itemClassName="w-[190px] sm:w-[210px] lg:w-[225px]"
      renderItem={(product) => <ProductCard product={product} compact />}
    />
  );
}
