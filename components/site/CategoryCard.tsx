import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CategoryCard({
  name,
  slug,
  description,
  image,
}: {
  name: string;
  slug: string;
  description: string;
  image: string;
}) {
  return (
    <div className="card group overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest-50">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-forest-900/10 to-transparent" />
        <h3 className="absolute bottom-4 left-4 font-display text-xl font-bold text-cream-100">
          {name}
        </h3>
      </div>
      <div className="p-5">
        <p className="text-sm text-forest-500 line-clamp-2">{description}</p>
        <Link
          href={`/categories/${slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900"
        >
          Explore Products <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
