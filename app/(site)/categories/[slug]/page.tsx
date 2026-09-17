import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { buildProductQuery } from "@/lib/product-filters";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductSort } from "@/components/site/ProductSort";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };
  return { title: category.name, description: category.description };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategory(slug);
  if (!category || category.status !== "ACTIVE") notFound();

  const urlParams = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]
  );
  urlParams.set("category", slug);

  const { where, orderBy } = buildProductQuery(urlParams);
  const page = Math.max(1, Number(sp.page ?? "1"));
  const pageSize = 12;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image src={category.image} alt={category.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-forest-900/60" />
        <div className="container-page relative flex h-full flex-col justify-end pb-8 text-cream-100">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{category.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-cream-200">{category.description}</p>
        </div>
      </div>

      <div className="container-page py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-forest-500">
            {total} product{total === 1 ? "" : "s"} in {category.name}
          </p>
          <ProductSort />
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products in this category yet"
            description="Check back soon — we're always adding fresh products from our farm."
            actionHref="/products"
            actionLabel="Browse All Products"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
  );
}
