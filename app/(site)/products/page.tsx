import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildProductQuery } from "@/lib/product-filters";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilters } from "@/components/site/ProductFilters";
import { ProductSort } from "@/components/site/ProductSort";
import { SearchBar } from "@/components/site/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Fresh Farm Products",
  description:
    "Browse fresh eggs, milk, paneer, vegetables, fish, chicken, mutton and more — all grown and produced by PJR Farm & Agro Products.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const urlParams = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]
  );

  const { where, orderBy } = buildProductQuery(urlParams);
  const page = Math.max(1, Number(sp.page ?? "1"));
  const pageSize = 12;

  const [items, total, categories, subcategoryRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { displayOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE", subcategory: { not: null } },
      select: { subcategory: true },
      distinct: ["subcategory"],
    }),
  ]);

  const subcategories = subcategoryRows.map((r) => r.subcategory).filter(Boolean) as string[];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="section-heading">Shop Fresh Products</h1>
        <p className="section-subheading">
          {total} product{total === 1 ? "" : "s"} grown and produced across our integrated farm.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchBar />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <ProductFilters
            categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            subcategories={subcategories}
          />
        </div>

        <div>
          <div className="mb-4 flex justify-end">
            <ProductSort />
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your filters or search term to find what you're looking for."
              actionHref="/products"
              actionLabel="Clear Filters"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    categoryName: p.category.name,
                    description: p.description,
                    price: p.price,
                    discountPrice: p.discountPrice,
                    unit: p.unit,
                    weight: p.weight,
                    availability: p.availability,
                    stock: p.stock,
                    ratingAvg: p.ratingAvg,
                    ratingCount: p.ratingCount,
                    image: p.images[0]?.url ?? "",
                  }}
                />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
