import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? "fill-gold text-gold" : "fill-forest-100 text-forest-100"}
          />
        ))}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-forest-500">({count})</span>
      )}
    </div>
  );
}
