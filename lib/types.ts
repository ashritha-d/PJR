export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  description: string;
  price: number;
  discountPrice: number | null;
  unit: string;
  weight: string | null;
  availability: string;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  image: string;
};
