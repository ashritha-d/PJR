import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductActions } from "@/components/site/ProductActions";
import { ProductCard } from "@/components/site/ProductCard";
import { ReviewForm } from "@/components/site/ReviewForm";
import { ChevronRight, Truck, Snowflake, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product || product.status !== "ACTIVE") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, status: "ACTIVE", id: { not: product.id } },
    take: 4,
    include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const images = product.images.map((i) => i.url);

  return (
    <div className="container-page py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-forest-500">
        <Link href="/" className="hover:text-forest-800">Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-forest-800">Products</Link>
        <ChevronRight size={12} />
        <Link href={`/categories/${product.category.slug}`} className="hover:text-forest-800">
          {product.category.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-forest-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
            {product.category.name}
            {product.subcategory ? ` · ${product.subcategory}` : ""}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-800">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.ratingAvg} count={product.ratingCount} size={16} />
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                product.availability === "IN_STOCK"
                  ? "bg-forest-100 text-forest-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {product.availability === "IN_STOCK" ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-forest-800">
              {formatCurrency(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice != null && product.discountPrice < product.price && (
              <span className="text-lg text-forest-400 line-through">{formatCurrency(product.price)}</span>
            )}
            <span className="text-sm text-forest-500">/ {product.unit}</span>
          </div>
          {product.weight && <p className="mt-1 text-sm text-forest-500">Net weight: {product.weight}</p>}

          <p className="mt-4 text-sm leading-relaxed text-forest-600">{product.description}</p>

          <div className="mt-6">
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: images[0] ?? "",
                price: product.price,
                discountPrice: product.discountPrice,
                unit: product.unit,
                stock: product.stock,
                availability: product.availability,
              }}
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {product.farmSource && (
              <div className="rounded-2xl bg-forest-50 p-4">
                <MapPin size={18} className="mb-2 text-forest-600" />
                <p className="text-xs font-semibold text-forest-700">Farm Source</p>
                <p className="mt-1 text-xs text-forest-500">{product.farmSource}</p>
              </div>
            )}
            {product.storageInstructions && (
              <div className="rounded-2xl bg-forest-50 p-4">
                <Snowflake size={18} className="mb-2 text-forest-600" />
                <p className="text-xs font-semibold text-forest-700">Storage</p>
                <p className="mt-1 text-xs text-forest-500">{product.storageInstructions}</p>
              </div>
            )}
            {product.deliveryInfo && (
              <div className="rounded-2xl bg-forest-50 p-4">
                <Truck size={18} className="mb-2 text-forest-600" />
                <p className="text-xs font-semibold text-forest-700">Delivery</p>
                <p className="mt-1 text-xs text-forest-500">{product.deliveryInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-2xl font-bold text-forest-800">
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="mt-6 space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-forest-500">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <StarRating rating={r.rating} size={14} />
                    <span className="text-xs text-forest-400">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <h4 className="mt-2 font-semibold text-forest-800">{r.title}</h4>}
                  <p className="mt-1 text-sm text-forest-600">{r.comment}</p>
                  <p className="mt-2 text-xs font-medium text-forest-500">— {r.user.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <ReviewForm productId={product.id} />
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-forest-800">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
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
        </div>
      )}
    </div>
  );
}
