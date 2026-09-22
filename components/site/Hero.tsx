"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

export type HeroSlide = {
  title: string;
  subtitle: string;
  buttonText?: string | null;
  buttonLink?: string | null;
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-forest-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "url('/brand/leaf-pattern.svg')", backgroundSize: "220px" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent" />
      </div>

      <Leaf className="animate-float absolute left-[8%] top-[15%] hidden text-forest-500/30 sm:block" size={44} />
      <Leaf className="animate-float absolute right-[12%] top-[50%] hidden text-gold/20 sm:block" size={34} style={{ animationDelay: "2s" }} />
      <Leaf className="animate-float absolute left-[20%] bottom-[10%] hidden text-forest-400/20 sm:block" size={28} style={{ animationDelay: "4s" }} />

      <div className="container-page relative flex min-h-[110px] flex-col justify-center py-2 sm:min-h-[125px] sm:py-2.5">
        <div className="max-w-3xl">
          <div className="mb-0.5 flex items-center gap-2">
            <Image
              src="/brand/logo-emblem.jpg"
              alt="PJR Farm emblem"
              width={48}
              height={48}
              className="h-11 w-11 shrink-0 rounded-full border-2 border-gold object-cover"
            />
            <span className="inline-block rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold-light">
              Est. 2017 &middot; Integrated Farming
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight text-cream-100 sm:text-3xl lg:text-4xl">
            {slide.title}
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm text-cream-300 sm:text-base">{slide.subtitle}</p>

          <div className="mt-1 flex flex-wrap gap-2.5">
            <Link href={slide.buttonLink || "/products"} className="btn-gold !px-4 !py-1.5 !text-sm">
              {slide.buttonText || "Shop Fresh Products"}
            </Link>
            {slide.buttonLink !== "/our-farming" && (
              <Link href="/our-farming" className="btn-secondary !border-cream-100 !px-4 !py-1.5 !text-sm !text-cream-100 hover:!bg-cream-100 hover:!text-forest-900">
                Explore Our Farm
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          <button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="rounded-full bg-white/10 p-2 text-cream-100 backdrop-blur hover:bg-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="rounded-full bg-white/10 p-2 text-cream-100 backdrop-blur hover:bg-white/20"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
