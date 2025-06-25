"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  images: { node: { url: string; altText?: string | null } }[];
};

export default function ProductGallery({ images }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  /* ───────── Eventos ───────── */
  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // estado inicial
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  /* ───────── Render ───────── */
  return (
    <div className="-mx-6 relative overflow-hidden">
      {/* Carrusel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map(({ node }, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <Image
                src={node.url}
                alt={node.altText ?? ""}
                width={880}
                height={1120}
                className="w-full object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Imagen ${i + 1}`}
            className={`
              h-2 w-2 rounded-full transition-opacity
              ${
                selected === i
                  ? "bg-white opacity-100"
                  : "bg-white/60 opacity-40"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
