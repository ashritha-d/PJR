import { StarRating } from "@/components/ui/StarRating";
import { Quote } from "lucide-react";

export type Testimonial = { name: string; location: string; rating: number; comment: string };

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-20">
      <div className="container-page">
        <div className="text-center">
          <h2 className="section-heading">What Families Say</h2>
          <p className="section-subheading mx-auto">Real feedback from real families we serve every week.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="card relative p-6">
              <Quote className="absolute right-5 top-5 text-forest-100" size={36} />
              <StarRating rating={t.rating} />
              <p className="mt-3 text-sm text-forest-600">&ldquo;{t.comment}&rdquo;</p>
              <div className="mt-4 border-t border-forest-100 pt-3">
                <p className="text-sm font-semibold text-forest-800">{t.name}</p>
                <p className="text-xs text-forest-400">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
