import type { Prisma } from "@prisma/client";

export function buildProductQuery(sp: URLSearchParams) {
  const q = sp.get("q")?.trim();
  const category = sp.get("category");
  const subcategory = sp.get("subcategory");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const availability = sp.get("availability");
  const minRating = sp.get("minRating");
  const sort = sp.get("sort") ?? "newest";
  const featured = sp.get("featured");

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { subcategory: { contains: q } },
    ];
  }
  if (category) where.category = { slug: category };
  if (subcategory) where.subcategory = subcategory;
  if (availability) where.availability = availability;
  if (featured === "true") where.isFeatured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (minRating) where.ratingAvg = { gte: Number(minRating) };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "popular") orderBy = { ratingCount: "desc" };
  else if (sort === "rating") orderBy = { ratingAvg: "desc" };

  return { where, orderBy, sort };
}

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Best Rated" },
];
