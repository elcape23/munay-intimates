// src/components/home/ProductCarousel.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  ProductCard,
  ProductCardProps,
} from "@/components/common/product-card";

interface Props {
  title: string;
  data: ProductCardProps[]; // reutilizamos la misma interfaz
}

export function ProductCarousel({ title, data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1️⃣ Auto‐centra al mount
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    // calcula el scrollLeft que deja el punto medio del contenido en el centro
    c.scrollTo({
      left: (c.scrollWidth - c.clientWidth) / 2,
      behavior: "auto",
    });
  }, [data]); // vuelve a centrar si cambian los datos

  return (
    <section className="mt-6 bg-background-primary-default">
      <h2 className="heading-06-medium text-left ml-6 mb-3">{title}</h2>
      <div className="relative">
        <div
          ref={containerRef}
          className="
            flex overflow-x-auto overflow-y-hidden
            scroll-smooth snap-x snap-mandatory no-scrollbar
          "
        >
          {data.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-64 snap-center px-1">
              <ProductCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
