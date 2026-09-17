import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Sprout, Award, Heart, Leaf, Users, Home, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Farming",
  description:
    "Explore PJR Farm's integrated farming ecosystem — crop cultivation, dairy farming, fresh vegetables, pisciculture, poultry farming and livestock rearing working together.",
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "crop-cultivation": "crop-cultivation",
  "dairy-farming": "dairy-farming",
  "fresh-vegetables": "fresh-vegetables",
  pisciculture: "pisciculture",
  "poultry-farming": "poultry-farming",
  "livestock-rearing": "livestock-rearing",
};

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Responsible Farming" },
  { icon: Sprout, label: "Sustainable Practices" },
  { icon: Award, label: "Quality Production" },
  { icon: Heart, label: "Animal Well-being" },
  { icon: Leaf, label: "Freshness" },
  { icon: Users, label: "Community Livelihood" },
  { icon: Home, label: "Farm-to-Family Approach" },
];

export default async function OurFarmingPage() {
  const sections = await prisma.farmSection.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <section className="bg-forest-900 py-16 text-center text-cream-100">
        <div className="container-page">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Our Integrated Farming Ecosystem</h1>
          <p className="mx-auto mt-4 max-w-2xl text-cream-300">
            At PJR Farm, no single part of the farm stands alone. Crops feed livestock, livestock enrich the soil,
            ponds and sheds share the same land and care — together forming one sustainable, farm-to-family
            ecosystem.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap justify-center gap-3">
          {HIGHLIGHTS.map((h) => (
            <span key={h.label} className="flex items-center gap-2 rounded-full bg-forest-50 px-4 py-2 text-sm font-medium text-forest-700">
              <h.icon size={16} /> {h.label}
            </span>
          ))}
        </div>
      </section>

      <div className="container-page space-y-16 pb-20">
        {sections.map((section, i) => (
          <div key={section.id} className={`grid gap-8 lg:grid-cols-2 lg:items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src={section.image} alt={section.title} fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
                0{i + 1} &middot; Farming Ecosystem
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-forest-800 sm:text-3xl">{section.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-forest-600">{section.description}</p>
              {CATEGORY_SLUG_MAP[section.key] && (
                <Link
                  href={`/categories/${CATEGORY_SLUG_MAP[section.key]}`}
                  className="mt-5 inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:text-forest-900"
                >
                  Shop {section.title} Products <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-forest-50/60 py-16">
        <div className="container-page text-center">
          <h2 className="section-heading">How It All Works Together</h2>
          <p className="section-subheading mx-auto">
            Crop residue and dairy waste enrich our soil naturally. Pond water supports irrigation cycles. Poultry
            and livestock share grazing land with our fields. Every part of PJR Farm supports another — reducing
            waste, strengthening the land, and keeping our community&apos;s livelihood rooted in the same soil for
            generations to come.
          </p>
        </div>
      </section>
    </div>
  );
}
