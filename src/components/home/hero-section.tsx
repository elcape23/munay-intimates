// src/components/home/hero-section.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

interface HeroSlide {
  id: string;
  image: string; // Ruta relativa en /public o URL completa
  title: string;
  subtitle: string;
  ButtonText: string;
  href?: string;
}

/** Slides definidos internamente para no ensuciar page.tsx */
const SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: "/images/hero/hero-1.webp",
    title: "New Arrivals",
    subtitle: "",
    ButtonText: "Descubrir",
    href: "/collections/new",
  },
  {
    id: "2",
    image: "/images/hero/hero-2.webp",
    title: "Íntimos sin clip",
    subtitle: "Comodidad absoluta cada día",
    ButtonText: "Descubrir más",
    href: "/no-clip",
  },
  {
    id: "3",
    image: "/images/hero/hero-3.webp",
    title: "Nuevos lanzamientos",
    subtitle: "Lo último en lencería Munay",
    ButtonText: "Explorar novedades",
    href: "/new",
  },
];

interface HeroSectionProps {
  autoPlay?: boolean;
  intervalMs?: number;
}

export function HeroSection({
  autoPlay = true,
  intervalMs = 5000,
}: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );

    const current = sectionRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || !inView) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Limpia el timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, intervalMs);

    // Cleanup al desmontar o antes del siguiente efecto
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current, autoPlay, intervalMs, inView]);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      {/* Contenedor deslizante */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className="relative w-full h-screen max-h-[640px] flex-shrink-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 flex h-full flex-col px-6 justify-end text-left text-text-primary-invert">
              <h2 className="text-[70px] heading-02-semibold leading-none mb-4">
                {slide.title}
              </h2>
              <Button
                asChild
                variant="link"
                size="lg"
                className="flex justify-start px-0 mb-20 text-text-primary-invert body-01-medium underline-offset-[4px]"
              >
                <Link href={slide.href ?? "#"} className="flex items-center">
                  <ArrowLongRightIcon className="ml-1 h-6 w-6 inline" />
                  {slide.ButtonText}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
