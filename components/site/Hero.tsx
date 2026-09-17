"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
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
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover opacity-50 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-900/70 to-forest-900/30" />
      </div>

      <Leaf className="animate-float absolute left-[8%] top-[20%] hidden text-forest-500/30 sm:block" size={64} />
      <Leaf className="animate-float absolute right-[12%] top-[55%] hidden text-gold/20 sm:block" size={48} style={{ animationDelay: "2s" }} />
      <Leaf className="animate-float absolute left-[20%] bottom-[10%] hidden text-forest-400/20 sm:block" size={40} style={{ animationDelay: "4s" }} />

      <div className="container-page relative flex min-h-[560px] flex-col justify-center py-20 sm:min-h-[620px]">
        <div className="max-w-2xl">
          <Image
            src="/brand/logo-emblem.jpg"
            alt="PJR Farm emblem"
            width={72}
            height={72}
            className="mb-6 h-16 w-16 rounded-full border-2 border-gold object-cover"
          />
          <span className="mb-4 inline-block rounded-full bg-gold/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-light">
            Est. 2017 &middot; Integrated Farming
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-cream-100 sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream-300 sm:text-lg">{slide.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={slide.buttonLink || "/products"} className="btn-gold">
              {slide.buttonText || "Shop Fresh Products"}
            </Link>
            {slide.buttonLink !== "/our-farming" && (
              <Link href="/our-farming" className="btn-secondary !border-cream-100 !text-cream-100 hover:!bg-cream-100 hover:!text-forest-900">
                Explore Our Farm
              </Link>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
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
