"use client";

import { CategoryCard } from "@/components/site/CategoryCard";
import { HorizontalSlider } from "@/components/site/HorizontalSlider";

type CategorySliderItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export function CategorySlider({ categories }: { categories: CategorySliderItem[] }) {
  return (
    <HorizontalSlider
      items={categories}
      ariaLabel="categories"
      itemClassName="w-[260px] sm:w-[300px] lg:w-[320px]"
      renderItem={(category) => (
        <CategoryCard
          name={category.name}
          slug={category.slug}
          description={category.description}
          image={category.image}
        />
      )}
    />
  );
}
