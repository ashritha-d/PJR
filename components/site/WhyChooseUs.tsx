import { getIcon } from "@/lib/icon-map";

export type WhyChooseItem = { icon: string; title: string; description: string };

export function WhyChooseUs({ items }: { items: WhyChooseItem[] }) {
  return (
    <section className="bg-forest-50/60 py-20">
      <div className="container-page">
        <div className="text-center">
          <h2 className="section-heading">Why Choose PJR Farm</h2>
          <p className="section-subheading mx-auto">
            Rooted in tradition, driven by sustainability, and committed to quality in every product we grow.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={item.title} className="card flex flex-col items-center gap-3 p-6 text-center">
                <div className="rounded-2xl bg-forest-700 p-3 text-cream-100">
                  <Icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-forest-800">{item.title}</h3>
                <p className="text-xs text-forest-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
