// src/components/home/ProductCarousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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

  // 2️⃣ Detecta cuando el carrusel entra en la vista
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const current = sectionRef.current;
    if (current) observer.observe(current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="mt-6"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
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
    </motion.section>
  );
}
