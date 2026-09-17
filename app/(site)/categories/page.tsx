import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/site/CategoryCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse PJR Farm & Agro Products by category — crops, dairy, vegetables, fish, poultry and livestock.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
  });

  return (
    <div className="container-page py-10">
      <div className="mb-10 text-center">
        <h1 className="section-heading">Shop by Category</h1>
        <p className="section-subheading mx-auto">
          Every category represents a part of our integrated farming ecosystem, working together to bring wholesome
          food to your table.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard
            key={c.id}
            name={c.name}
            slug={c.slug}
            description={`${c.description} (${c._count.products} product${c._count.products === 1 ? "" : "s"})`}
            image={c.image}
          />
        ))}
      </div>
    </div>
  );
}
