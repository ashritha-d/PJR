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
      itemClassName="w-[170px] sm:w-[155px] lg:w-[140px]"
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
