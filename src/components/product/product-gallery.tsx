"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { FavoriteButton } from "@/components/common/favorite-button";
import { ShareButton } from "@/components/common/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  images: { node: { url: string; altText?: string | null } }[];
  productHandle: string;
};

export default function ProductGallery({ images, productHandle }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(() =>
    new Array(images.length).fill(false)
  );
  const allLoaded = loaded.every(Boolean);

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

  useEffect(() => {
    setLoaded(new Array(images.length).fill(false));
  }, [images.length]);

  /* ───────── Render ───────── */
  return (
    <div className="-mx-6 relative overflow-hidden">
      {/* Botones de acción */}
      <div className="absolute top-16 right-6 z-10 flex flex-col gap-5">
        {allLoaded ? (
          <>
            <FavoriteButton productHandle={productHandle} />
            <ShareButton />
          </>
        ) : (
          <>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </>
        )}
      </div>
      {/* Carrusel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map(({ node }, i) => (
            <div
              key={i}
              className="relative min-w-0 flex-[0_0_100%] aspect-[4/5]"
            >
              {" "}
              {!loaded[i] && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full transition-opacity duration-300" />
              )}
              <Image
                src={node.url}
                alt={node.altText ?? ""}
                width={880}
                height={1120}
                className={cn(
                  "w-full object-cover transition-opacity duration-300",
                  loaded[i] ? "opacity-100" : "opacity-0"
                )}
                priority={i === 0}
                onLoad={() =>
                  setLoaded((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {!allLoaded
          ? images.map((_, i) => (
              <Skeleton key={i} className="h-2 w-2 rounded-full" />
            ))
          : images.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Imagen ${i + 1}`}
                className={cn(
                  "h-2 w-2 rounded-full transition-opacity mix-blend-difference",
                  selected === i
                    ? "bg-white opacity-100"
                    : "bg-white/60 opacity-40"
                )}
              />
            ))}
      </div>
    </div>
  );
}
