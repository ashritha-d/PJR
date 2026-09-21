import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  name,
  slug,
  description,
  image,
  compact = false,
}: {
  name: string;
  slug: string;
  description: string;
  image: string;
  compact?: boolean;
}) {
  return (
    <div className="card group overflow-hidden">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-forest-50",
          compact ? "aspect-[2/1]" : "aspect-[4/3]"
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-forest-900/10 to-transparent" />
        <h3
          className={cn(
            "absolute font-display font-bold text-cream-100",
            compact ? "bottom-2 left-3 text-sm" : "bottom-4 left-4 text-xl"
          )}
        >
          {name}
        </h3>
      </div>
      <div className={compact ? "p-2.5" : "p-5"}>
        <p className={cn("text-forest-500 line-clamp-2", compact ? "text-xs" : "text-sm")}>{description}</p>
        <Link
          href={`/categories/${slug}`}
          className={cn(
            "inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-900",
            compact ? "mt-1 text-xs" : "mt-4 text-sm"
          )}
        >
          Explore Products <ArrowRight size={compact ? 12 : 16} />
        </Link>
      </div>
    </div>
  );
}
