"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : ["/placeholders/vegetables.svg"];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-forest-50">
        <Image src={gallery[active]} alt={name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
      </div>
      {gallery.length > 1 && (
        <div className="mt-4 flex gap-3">
          {gallery.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                active === i ? "border-forest-700" : "border-transparent opacity-70"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
