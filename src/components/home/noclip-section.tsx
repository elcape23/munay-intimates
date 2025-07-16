"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface NoClipSectionProps {
  images: string[];
  href?: string;
}

export const NoClipSection: React.FC<NoClipSectionProps> = ({
  images,
  href,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Alinea el carrusel a la izquierda al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("noclip-section-scroll");
      } catch {
        // ignoramos cualquier error (por ejemplo, modo privado)
      }
    }

    const c = containerRef.current;
    if (!c) return;
    c.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  // Detectar cuando la sección entra en la vista
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          const c = containerRef.current;
          if (c) c.scrollTo({ left: 0, behavior: "auto" });
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
      id="noclip-section"
      className="py-8 space-y-3 bg-background-primary-default"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Título */}
      <h2 className="heading-06-medium ml-6">Bienvenido Invierno!</h2>

      {/* Carousel con slides de imagen y slide de "Ver más" */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-3 scroll-smooth"
      >
        {images.map((src, idx) => (
          <Link
            key={idx}
            href={href ?? "#"}
            className="snap-start flex-shrink-0 w-[300px] h-[300px] overflow-hidden"
          >
            <img
              src={src}
              alt={`Invierno Slide ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </Link>
        ))}

        {/* Slide de "Ver más" al final */}
        <Link
          href={href ?? "#"}
          className="snap-start flex-shrink-0 inline-flex flex-col px-8 h-75 justify-center cursor-pointer space-y-3"
        >
          <ArrowLongRightIcon className="w-8 h-8 mt-2 text-icon-primary-default" />
          <span className="heading-05-medium text-primary-default">
            Ver más
          </span>
        </Link>
      </div>
    </motion.section>
  );
};
