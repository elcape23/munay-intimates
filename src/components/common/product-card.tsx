// src/components/common/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "./favorite-button";
import { COLOR_MAP } from "@/lib/color-map";

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
  size?: "default" | "small";
  /** If true, image adapts to parent width */
  fill?: boolean;
}

function parsePrice(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9,.-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
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
  size = "default",
  fill = false,
}: ProductCardProps) {
  // calcula % de descuento redondeado
  const discountPercent = compareAtPrice
    ? Math.min(
        99,
        Math.round((1 - parsePrice(price) / parsePrice(compareAtPrice)) * 100)
      )
    : 0;

  return (
    <div className="relative">
      <Link
        href={`/products/${handle}`}
        className={`flex flex-col bg-transparent ${
          size === "small" ? "h-[315px]" : "h-auto"
        } overflow-hidden hover:transition-shadow duration-300`}
      >
        {/* Imagen */}
        <div
          className={`relative w-full overflow-hidden ${
            fill ? "aspect-[220/328]" : ""
          }`}
        >
          {fill ? (
            <Image
              src={imageSrc}
              alt={altText ?? title}
              fill
              className="object-cover w-full h-full rounded-[2px] group-hover:scale-105 transition-transform duration-300"
              priority
            />
          ) : (
            <Image
              src={imageSrc}
              alt={altText ?? title}
              width={220}
              height={328}
              className="object-cover w-full h-auto rounded-[2px] group-hover:scale-105 transition-transform duration-300"
              priority
            />
          )}
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
        <div className={`py-2 space-y-2 ${size === "small" ? "pl-4" : ""}`}>
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
                const isWhite =
                  bgColor.toLowerCase() === "#ffffff" ||
                  bgColor.toLowerCase() === "#fff" ||
                  bgColor.toLowerCase() === "white";
                return (
                  <span
                    key={i}
                    className={`h-4 w-4 m-[2px] rounded-full ${
                      isWhite ? "border border-border-secondary-default" : ""
                    }`}
                    style={{ backgroundColor: bgColor }}
                    title={color}
                  />
                );
              })}
            </div>
          )}{" "}
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
          </div>{" "}
        </div>
      </Link>
      {/* Icono Favorito separado del enlace para evitar propagación */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton productHandle={handle} />{" "}
      </div>{" "}
    </div>
  );
}
