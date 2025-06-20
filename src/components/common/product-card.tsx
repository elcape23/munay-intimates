// src/components/common/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { Button } from "../ui/button";

export interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  imageSrc: string;
  altText?: string;
  price: string; // e.g. "24.99"
  compareAtPrice?: string; // e.g. "29.99"
  isNew?: boolean; // marca NEW
  colorVariants?: string[]; // lista de colores (hex o clases Tailwind)
}

export function ProductCard({
  title,
  handle,
  imageSrc,
  altText,
  price,
  compareAtPrice,
  isNew = false,
  colorVariants = [],
}: ProductCardProps) {
  // calcula % de descuento redondeado
  const discountPercent = compareAtPrice
    ? Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)
    : 0;

  return (
    <Link
      href={`/product/${handle}`}
      className="group block relative bg-transparent h-[420px] overflow-hidden hover:transition-shadow duration-300"
    >
      {/* Imagen */}
      <div className="relative h-[328px] w-[100%] overflow-hidden">
        <Image
          src={imageSrc}
          alt={altText ?? title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
        />
        {/* Icono Favorito */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
        >
          <HeartOutline />
        </Button>
        {/* Badge Oferta o NEW */}
        {compareAtPrice ? (
          <div className="absolute bottom-3 left-3 z-10 p-1 bg-background-fill-danger-default body-02-semibold text-text-primary-invert">
            {discountPercent}%
          </div>
        ) : isNew ? (
          <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 bg-background-fill-neutral-default body-02-semibold text-text-primary-invert">
            NEW
          </div>
        ) : null}
      </div>

      {/* Detalle */}
      <div className="py-2 gap-1">
        {/* Título */}
        <h3 className="body-01-medium text-text-primary-default line-clamp-2">
          {title}
        </h3>

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <div className="flex items-center space-x-1 mt-2">
            {colorVariants.map((color, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full border border-border-subtle"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Precios */}
        <div className="flex items-baseline space-x-2">
          {compareAtPrice && (
            <span className="body-01-regular line-through text-decoration-color-red text-text-secondary-default">
              ${compareAtPrice}
            </span>
          )}
          <span className="body-01-medium text-text-primary-default">
            ${price}
          </span>
        </div>
      </div>
    </Link>
  );
}
