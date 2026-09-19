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
      itemClassName="w-[230px] sm:w-[260px] lg:w-[290px]"
      renderItem={(category) => (
        <CategoryCard
          name={category.name}
          slug={category.slug}
          description={category.description}
          image={category.image}
          compact
        />
      )}
    />
  );
}
