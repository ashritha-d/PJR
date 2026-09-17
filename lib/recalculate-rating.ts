import { prisma } from "@/lib/prisma";

export async function recalculateProductRating(productId: string) {
  const approved = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    select: { rating: true },
  });

  // Only overwrite when there's at least one real approved review — this keeps a
  // freshly seeded product's baseline rating intact until genuine reviews exist for it.
  if (approved.length === 0) return;

  const ratingCount = approved.length;
  const ratingAvg = approved.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

  await prisma.product.update({
    where: { id: productId },
    data: { ratingAvg, ratingCount },
  });
}
