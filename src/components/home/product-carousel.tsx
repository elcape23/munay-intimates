// src/components/home/ProductCarousel.tsx
"use client";

import { useRef } from "react";

interface Props {
  title: string;
  data: Array<{ id: string; image: string; name: string }>;
}

export function ProductCarousel({ title, data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    containerRef.current.scrollBy({
      left: dir === "left" ? -clientWidth : clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ‹
        </button>
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {data.map((item) => (
            <div key={item.id} className="min-w-[200px] flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full rounded"
              />
              <p className="mt-2 text-center">{item.name}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 p-2 bg-white rounded-full shadow"
        >
          ›
        </button>
      </div>
    </section>
  );
}
