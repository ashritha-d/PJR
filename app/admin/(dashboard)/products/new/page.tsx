import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-forest-800">Add New Product</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
