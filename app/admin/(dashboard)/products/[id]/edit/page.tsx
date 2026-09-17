import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: "asc" } } } }),
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-forest-800">Edit Product</h2>
      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          name: product.name,
          categoryId: product.categoryId,
          subcategory: product.subcategory ?? "",
          description: product.description,
          farmSource: product.farmSource ?? "",
          storageInstructions: product.storageInstructions ?? "",
          deliveryInfo: product.deliveryInfo ?? "",
          price: String(product.price),
          discountPrice: product.discountPrice != null ? String(product.discountPrice) : "",
          sku: product.sku,
          stock: String(product.stock),
          unit: product.unit,
          weight: product.weight ?? "",
          isFeatured: product.isFeatured,
          status: product.status as "ACTIVE" | "INACTIVE",
          images: product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
