"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import {
  ProductCard,
  ProductCardProps,
} from "@/components/common/product-card";

export interface ExploreSectionProps {
  title: string;
  product: ProductCardProps;
}

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  title,
  product,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Centrar el contenido horizontalmente cuando entre en pantalla
  useEffect(() => {
    const c = containerRef.current;
    if (!c || !inView) return;
    c.scrollTo({ left: (c.scrollWidth - c.clientWidth) / 2, behavior: "auto" });
  }, [inView]);

  // Detectar cuando la sección entra en la vista
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
      id="explore-section"
      className="pb-8 px-6 bg-background-primary-default"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        ref={containerRef}
        className="flex flex-row md:flex-row items-center gap-3 overflow-x-auto no-scrollbar"
      >
        <div className="flex-1 text-start space-y-3">
          <ArrowLongRightIcon className="w-8 h-8 mt-2 text-icon-primary-default" />
          <h3 className="heading-05-medium mb-2">{title}</h3>
        </div>
        <div className="flex-1 max-w-sm  overflow-hidden">
          <img
            src="/images/explore/bombacha-sexy.png"
            alt="Bombacha Sexy Bit"
            className="w-full h-60 object-cover rounded-[2px]"
          />
          <div className="pl-3 py-2 ">
            <h4 className="body-01-medium text-text-primary-default truncate whitespace-nowrap">
              Bombacha Sexy Bitch
            </h4>
            <p className="body-02-regular text-text-secondary-default mt-1">
              Ropa Interior
            </p>
            <p className="body-01-semibold text-text-primary-default mt-2">
              $31.999
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
