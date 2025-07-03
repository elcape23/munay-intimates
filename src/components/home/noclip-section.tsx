"use client";

import React, { useEffect, useRef } from "react";
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

  // Auto-centra el carrusel al montarse
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.scrollTo({
      left: (c.scrollWidth - c.clientWidth) / 2,
      behavior: "auto",
    });
  }, [images]);

  return (
    <section
      id="noclip-section"
      className="py-8 space-y-3 bg-background-primary-default"
    >
      {/* Título */}
      <h2 className="heading-06-medium ml-6">Bienvenido Invierno!</h2>

      {/* Carousel con slides de imagen y slide de "Ver más" */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar space-x-3 scroll-smooth"
      >
        {images.map((src, idx) => (
          <div
            key={idx}
            className="snap-start flex-shrink-0 w-75 h-75 overflow-hidden"
          >
            <img
              src={src}
              alt={`Invierno Slide ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
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
    </section>
  );
};
