// src/components/home/hero-section.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useIntroStore } from "@/store/intro-store";

interface HeroSlide {
  id: string;
  image: {
    mobile: string;
    desktop: string;
  };
  title: string;
  subtitle: string;
  ButtonText: string;
  href?: string;
}

/** Slides definidos internamente para no ensuciar page.tsx */
const SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: {
      mobile: "/images/hero/mobile/slide-2.webp",
      desktop: "/images/hero/desktop/slide-2.webp",
    },
    title: "Noches con estilo",
    subtitle: "Comodidad absoluta cada día",
    ButtonText: "Descubrir más",
    href: "/collections/pijamas",
  },
  {
    id: "2",
    image: {
      mobile: "/images/hero/mobile/slide-1.webp",
      desktop: "/images/hero/desktop/slide-1.webp",
    },
    title: "New Arrivals",
    subtitle: "",
    ButtonText: "Descubrir",
    href: "/collections/new",
  },
  {
    id: "3",
    image: {
      mobile: "/images/hero/mobile/slide-3.webp",
      desktop: "/images/hero/desktop/slide-3.webp",
    },
    title: "Días relajados",
    subtitle: "Lo último en lencería Munay",
    ButtonText: "Explorar novedades",
    href: "/new",
  },
];

// Duration of the slide transition in seconds. Keep this value in sync
// with the `duration-700` class on the slider container.
const SLIDE_TRANSITION_SEC = 0.7;
const INTRO_DELAY_MS = 4300;

interface HeroSectionProps {
  autoPlay?: boolean;
  intervalMs?: number;
}

export function HeroSection({
  autoPlay = true,
  intervalMs = 3000,
}: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const introDone = useIntroStore((state) => state.done);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>(() =>
    new Array(SLIDES.length).fill(false)
  );

  const imageLoadCounts = useRef<number[]>(new Array(SLIDES.length).fill(0));

  useEffect(() => {
    setLoaded(new Array(SLIDES.length).fill(false));
    imageLoadCounts.current = new Array(SLIDES.length).fill(0);
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    const counts = imageLoadCounts.current;
    counts[index] = Math.min(counts[index] + 1, 2);

    if (counts[index] >= 2) {
      setLoaded((prev) => {
        if (prev[index]) return prev;

        const next = [...prev];
        next[index] = true;
        return next;
      });
    }
  }, []);

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

  const goToSlide = useCallback((index: number) => {
    const slider = sliderRef.current;

    if (slider) {
      slider.scrollTo({
        left: index * slider.clientWidth,
        behavior: "smooth",
      });
    }

    setCurrent(index);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!autoPlay || !inView) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const nextIndex = (current + 1) % SLIDES.length;
      goToSlide(nextIndex);
    }, intervalMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current, autoPlay, intervalMs, inView, goToSlide]);

  const allLoaded = loaded.every(Boolean);
  useEffect(() => {
    let frameId: number | null = null;
    let startTime: number | null = null;

    if (!autoPlay || !inView) {
      setProgress(0);
      return;
    }

    if (intervalMs <= 0) {
      setProgress(1);
      return;
    }

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(elapsed / intervalMs, 1);
      setProgress(nextProgress);

      if (nextProgress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    setProgress(0);
    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [current, autoPlay, inView, intervalMs]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.clientWidth);
      setCurrent(index);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => {
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      {/* Contenedor deslizante */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {SLIDES.map((slide, idx) => {
          const slideLoaded = loaded[idx];

          return (
            <div
              key={slide.id}
              className="relative w-full h-screen max-h-[640px] flex-shrink-0 snap-center cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) return;
                if (slide.href) router.push(slide.href);
              }}
            >
              {!slideLoaded && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full transition-opacity duration-300" />
              )}
              <div className="absolute inset-0">
                <Image
                  src={slide.image.mobile}
                  alt={slide.title}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300 lg:hidden",
                    slideLoaded ? "opacity-100" : "opacity-0"
                  )}
                  priority={idx === 0}
                  sizes="(min-width: 1024px) 0px, 100vw"
                  onLoadingComplete={() => handleImageLoad(idx)}
                />
                <Image
                  src={slide.image.desktop}
                  alt={slide.title}
                  fill
                  className={cn(
                    "hidden object-cover transition-opacity duration-300 lg:block",
                    slideLoaded ? "opacity-100" : "opacity-0"
                  )}
                  priority={idx === 0}
                  sizes="(min-width: 1024px) 100vw, 0px"
                  onLoadingComplete={() => handleImageLoad(idx)}
                />
              </div>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex h-full flex-col px-6 justify-end text-left text-text-primary-invert">
                {!slideLoaded && (
                  <div className="mb-20">
                    <Skeleton className="mb-4 h-10 w-3/5 max-w-[320px]" />
                    <Skeleton className="h-8 w-32 max-w-[160px]" />
                  </div>
                )}
                <AnimatePresence mode="wait">
                  {current === idx && introDone && slideLoaded && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: SLIDE_TRANSITION_SEC,
                      }}
                      className="mb-20"
                    >
                      <h2 className="text-[70px] heading-02-semibold leading-none mb-4">
                        {slide.title}
                      </h2>
                      <Button
                        asChild
                        variant="link"
                        size="lg"
                        className="flex justify-start px-0 text-text-primary-invert body-01-medium underline-offset-[4px]"
                        data-clarity-label={slide.ButtonText ?? "Ver más"}
                      >
                        <Link
                          href={slide.href ?? "#"}
                          className="flex items-center"
                        >
                          <ArrowLongRightIcon className="ml-1 h-6 w-6 inline" />
                          {slide.ButtonText}
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {!allLoaded
          ? SLIDES.map((_, idx) => (
              <Skeleton key={idx} className="h-2 w-2 rounded-full" />
            ))
          : SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-pressed={idx === current}
                aria-label={`Slide ${idx + 1}`}
                className={cn(
                  "relative h-2 overflow-hidden rounded-full bg-white/40 transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  idx === current ? "w-8" : "w-2"
                )}
                data-clarity-label={`Ir al slide ${idx + 1}`}
              >
                <span className="absolute inset-0 rounded-full bg-background-fill-neutral-invert/20" />
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-background-fill-neutral-invert"
                  style={{
                    width:
                      idx === current
                        ? `${Math.min(progress, 1) * 100}%`
                        : "0%",
                    transition: idx === current ? undefined : "width 0.2s ease",
                  }}
                />
              </button>
            ))}
      </div>
    </section>
  );
}
