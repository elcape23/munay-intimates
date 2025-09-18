// src/components/home/ProductCarousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ProductCard,
  ProductCardProps,
} from "@/components/common/product-card";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Props {
  title: string;
  data: ProductCardProps[]; // reutilizamos la misma interfaz
}

export function ProductCarousel({ title, data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // 1️⃣ Auto‐centra al mount
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    c.scrollTo({
      left: isDesktop ? 0 : (c.scrollWidth - c.clientWidth) / 2,
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
      className="mt-6 lg:px-32"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between pl-6 mb-3">
        <h2 className="heading-06-medium text-left">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Desplazar carrusel a la izquierda"
            className="inline-flex h-10 w-10 items-center justify-center text-icon-primary-default transition-colors hover:bg-background-fill-neutral-hover focus:outline-none focus:ring-2 focus:ring-border-primary-default/60 focus:ring-offset-2"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Desplazar carrusel a la derecha"
            className="inline-flex h-10 w-10 items-center justify-center text-icon-primary-default transition-colors hover:bg-background-fill-neutral-hover focus:outline-none focus:ring-2 focus:ring-border-primary-default/60 focus:ring-offset-2"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>{" "}
      <div className="relative">
        <div
          ref={containerRef}
          className="
            flex overflow-x-auto overflow-y-hidden
            scroll-smooth snap-x snap-mandatory no-scrollbar
            gap-2 lg:gap-4
          "
        >
          {data.map((item) => (
            <div
              key={item.id}
              className="
                flex-shrink-0 snap-center
                w-64
                sm:w-72
                lg:w-auto
                lg:basis-[calc((100%-3rem)/4)]
                lg:max-w-[calc((100%-3rem)/4)]
              "
            >
              {" "}
              <ProductCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
