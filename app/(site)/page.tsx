import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Hero, type HeroSlide } from "@/components/site/Hero";
import { CategorySlider } from "@/components/site/CategorySlider";
import { ProductSlider } from "@/components/site/ProductSlider";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Testimonials } from "@/components/site/Testimonials";
import { getHomeSafeImage } from "@/lib/home-safe-image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, homepageContent, categories, allProducts] = await Promise.all([
    prisma.banner.findMany({ where: { status: "ACTIVE" }, orderBy: { displayOrder: "asc" } }),
    prisma.homepageContent.findUnique({ where: { id: "singleton" } }),
    prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { displayOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 40,
      include: { category: { select: { name: true } }, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ]);

  const slides: HeroSlide[] = banners.length
    ? banners.map((b) => ({
        title: b.title,
        subtitle: b.subtitle ?? "",
        buttonText: b.buttonText,
        buttonLink: b.buttonLink,
      }))
    : homepageContent
    ? [
        {
          title: homepageContent.heroHeading,
          subtitle: homepageContent.heroSubheading,
          buttonText: "Shop Fresh Products",
          buttonLink: "/products",
        },
      ]
    : [];

  const whyChooseUs = homepageContent ? JSON.parse(homepageContent.whyChooseUs) : [];
  const testimonials = homepageContent ? JSON.parse(homepageContent.testimonials) : [];

  return (
    <>
      <Hero slides={slides} />

      <section className="py-4 sm:py-5">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="section-heading-compact">Our Farming Ecosystem</h2>
              <p className="section-subheading-compact">
                An integrated farm producing everything from crops to livestock, working together as one sustainable ecosystem.
              </p>
            </div>
            <Link href="/our-farming" className="hidden items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900 sm:flex">
              Learn how it works <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-3">
            <CategorySlider
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                image: getHomeSafeImage(c.image),
              }))}
            />
          </div>
        </div>
      </section>

      {allProducts.length > 0 && (
        <section className="bg-forest-50/60 py-4 sm:py-5">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="section-heading-compact">Fresh From PJR Farm</h2>
                <p className="section-subheading-compact">
                  Every product we grow and produce, in one place — swipe or use the arrows to browse.
                </p>
              </div>
              <Link href="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-900 sm:flex">
                View All Products <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-3">
              <ProductSlider
                products={allProducts.map((p) => ({
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  categoryName: p.category.name,
                  description: p.description,
                  price: p.price,
                  discountPrice: p.discountPrice,
                  unit: p.unit,
                  weight: p.weight,
                  availability: p.availability,
                  stock: p.stock,
                  ratingAvg: p.ratingAvg,
                  ratingCount: p.ratingCount,
                  image: getHomeSafeImage(p.images[0]?.url ?? ""),
                }))}
              />
            </div>

            <div className="mt-2 text-center sm:hidden">
              <Link href="/products" className="btn-primary !px-5 !py-2 !text-xs">
                View All Products <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {whyChooseUs.length > 0 && <WhyChooseUs items={whyChooseUs} />}

      <section className="py-20">
        <div className="container-page">
          <div className="card grid gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Our Promise</span>
              <p className="mt-4 font-display text-2xl italic text-forest-800 sm:text-3xl">
                &ldquo;At PJR Farm &amp; Agro Products, we believe that sustainable farming is not just about growing
                food—it is about nurturing the land, supporting livelihoods, and delivering trusted nutrition to
                every family.&rdquo;
              </p>
              <p className="mt-6 font-display text-xl font-bold text-forest-700">
                Nourishing Nature, Enriching Lives.
              </p>
              <Link href="/about" className="btn-secondary mt-6 inline-flex">
                Read Our Story <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              <Image
                src="/products/pjr-organic-rice-1.jpg"
                alt="PJR Farm organic rice, grown on our own fields"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && <Testimonials items={testimonials} />}
    </>
  );
}
