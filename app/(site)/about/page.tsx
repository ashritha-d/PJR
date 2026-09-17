import type { Metadata } from "next";
import Image from "next/image";
import { Sprout, Leaf, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Established in 2017, PJR Farm & Agro Products is an integrated farming enterprise rooted in Suryapet, Telangana, dedicated to responsible, sustainable farming.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-forest-900 py-20 text-center text-cream-100">
        <div className="container-page relative">
          <Image
            src="/brand/logo-emblem.jpg"
            alt="PJR Farm emblem"
            width={80}
            height={80}
            className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-gold object-cover"
          />
          <h1 className="mx-auto max-w-3xl font-display text-3xl font-bold sm:text-4xl">
            Rooted in Tradition. Driven by Sustainability. Committed to Quality.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-cream-300">
            Established in 2017, PJR Farm &amp; Agro Products is an integrated farming enterprise dedicated to
            producing wholesome and naturally grown agricultural products through responsible farming practices.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/farm/pisciculture-farmer-portrait.jpg" alt="Founder at the PJR Farm aquaculture pond" fill className="object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Our Story</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-forest-800 sm:text-3xl">
              A Farmer&apos;s Passion, Grown Into an Enterprise
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-forest-600">
              PJR Farm &amp; Agro Products began in Bibigudem village, Suryapet district, Telangana, with a simple
              belief: that farming, done responsibly, can nourish both land and family. What started as one
              family&apos;s dedication to their ancestral fields grew — guided by a deep respect for tradition and an
              equally strong pull toward sustainable, modern methods — into an integrated farm spanning crops, dairy,
              vegetables, fish, poultry and livestock.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-forest-600">
              Every harvest carries that same spirit forward: chemical-free paddy grown the traditional way, ponds
              tended with care for sustainable aquaculture, dairy and poultry units run with attention to animal
              well-being, and a belief that quality nutrition should reach every family&apos;s table — not just
              ours.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-50/60 py-16">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sprout,
              title: "Our Farming Philosophy",
              desc: "Integrated farming — crops, dairy, vegetables, fish, poultry and livestock working together as one sustainable ecosystem, not in isolation.",
            },
            {
              icon: ShieldCheck,
              title: "Our Commitment to Quality",
              desc: "Every batch is grown, raised and harvested with care, checked for freshness before it ever reaches a delivery box.",
            },
            {
              icon: Leaf,
              title: "Our Sustainable Approach",
              desc: "Natural pest control, careful water use in our ponds, and farming methods that protect the soil for the next generation.",
            },
            {
              icon: HeartHandshake,
              title: "Farm-to-Family",
              desc: "We cut out unnecessary middlemen so freshness — and fair value — reach both our farming community and your family.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="inline-flex rounded-xl bg-forest-700 p-2.5 text-cream-100">
                <item.icon size={20} />
              </div>
              <h3 className="mt-4 font-display font-semibold text-forest-800">{item.title}</h3>
              <p className="mt-2 text-sm text-forest-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="card grid gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Our Belief</span>
            <p className="mt-4 font-display text-2xl italic text-forest-800 sm:text-3xl">
              &ldquo;At PJR Farm &amp; Agro Products, we believe that sustainable farming is not just about growing
              food—it is about nurturing the land, supporting livelihoods, and delivering trusted nutrition to every
              family.&rdquo;
            </p>
            <p className="mt-6 font-display text-xl font-bold text-forest-700">Nourishing Nature, Enriching Lives.</p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image src="/farm/pisciculture-fish-farmers-day.jpg" alt="PJR Farm celebrating National Fish Farmers Day" fill className="object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
