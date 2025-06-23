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

const COLOR_MAP: Record<string, string> = {
  Negro: "#4a4741",
  Oliva: "#8D978E",
  Blanco: "#ffffff",
  Rojo: "#ff0000",
  Azul: "#0000ff",
  Celeste: "#aeb3b9",
  Beige: "#e0d5ca",
  // …añade aquí todos los nombres que uses
};

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
      href={`/products/${handle}`}
      className="flex flex-col relative bg-transparent h-[420px] overflow-hidden hover:transition-shadow duration-300"
    >
      {/* Imagen */}
      <div className="relative h-[328px] w-[100%] overflow-hidden">
        <Image
          src={imageSrc}
          alt={altText ?? title}
          fill
          className="object-cover w-full h-full rounded-[2px] group-hover:scale-105 transition-transform duration-300"
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
      <div className="flex-1 py-2 space-y-2">
        {/* Título */}
        <h3 className="body-01-medium text-text-primary-default truncate whitespace-nowrap line-clamp-2">
          {title}
        </h3>

        {colorVariants.length > 0 && (
          <div className="flex items-center">
            {colorVariants.map((color, i) => {
              // si ya viene en HEX (ej. "#123456") lo uso directo,
              // si no, busco en el mapa; si tampoco existe, uso gris por defecto
              const bgColor = color.startsWith("#")
                ? color
                : COLOR_MAP[color] ?? "#cccccc";

              return (
                <span
                  key={i}
                  className="h-4 w-4 m-[2px] rounded-full "
                  style={{ backgroundColor: bgColor }}
                  title={color}
                />
              );
            })}
          </div>
        )}

        {/* Precios */}
        <div className="flex items-baseline space-x-2">
          {compareAtPrice && (
            <span className="body-01-regular line-through decoration-border-danger-hover decoration-[2px] text-text-secondary-default">
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
