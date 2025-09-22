// src/components/common/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FavoriteButton } from "./favorite-button";
import { COLOR_MAP } from "@/lib/color-map";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatProductTitle } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  imageSrc: string;
  altText?: string;
  price: string; // e.g. "24.99"
  compareAtPrice?: string; // e.g. "29.99"
  isNew?: boolean; // marca NEW
  availableForSale?: boolean; // controla badge SIN STOCK
  colorVariants?: string[]; // lista de colores (hex o clases Tailwind)
  size?: "default" | "small";
  /** If true, image adapts to parent width */
  fill?: boolean;
  onImageLoad?: () => void;
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
  availableForSale = true,
  colorVariants = [],
  size = "default",
  fill = false,
  onImageLoad,
}: ProductCardProps) {
  const formattedTitle = formatProductTitle(title);
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const shouldUseFill = fill || size === "default";
  const imageClassName = cn(
    "object-cover w-full rounded-[2px] group-hover:scale-105 transition-transform duration-300 transition-opacity pointer-events-none",
    shouldUseFill ? "h-full" : "h-auto",
    loaded ? "opacity-100" : "opacity-0"
  );

  const hasNotifiedParentRef = useRef(false);

  const handleImageLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    setLoaded(false);
    hasNotifiedParentRef.current = false;
  }, [imageSrc]);
  useEffect(() => {
    if (loaded && !hasNotifiedParentRef.current) {
      hasNotifiedParentRef.current = true;
      onImageLoad?.();
    }
  }, [loaded, onImageLoad]);
  useEffect(() => {
    const img = imageRef.current;
    if (img?.complete && !loaded) {
      handleImageLoaded();
    }
  }, [imageSrc, loaded, handleImageLoaded]); // calcula % de descuento redondeado
  const priceNum = parsePrice(price);
  const compareNum = parsePrice(compareAtPrice ?? "");
  const isOnSale = Boolean(compareAtPrice) && compareNum > priceNum;
  const discountPercent = isOnSale
    ? Math.min(99, Math.round((1 - priceNum / compareNum) * 100))
    : 0;

  return (
    <div className="relative">
      {" "}
      <Link
        href={`/products/${handle}`}
        className={`flex flex-col bg-transparent ${
          size === "small" ? "h-[315px]" : "h-auto"
        } overflow-hidden hover:transition-shadow duration-300`}
        data-clarity-label={formattedTitle}
      >
        {/* Imagen */}
        <div className="relative w-full overflow-hidden aspect-[220/328] pointer-events-none">
          {!loaded && (
            <Skeleton className="absolute inset-0 z-10 h-full w-full transition-opacity duration-600 pointer-events-none" />
          )}
          {!loaded && (
            <Skeleton className="absolute bottom-3 left-3 z-10 h-6 w-14 pointer-events-none" />
          )}
          {shouldUseFill ? (
            <Image
              src={imageSrc}
              alt={altText ?? formattedTitle}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
              ref={imageRef}
              className={imageClassName}
              priority
              onLoad={handleImageLoaded}
              onError={handleImageLoaded}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={altText ?? title}
              width={220}
              height={328}
              ref={imageRef}
              className={imageClassName}
              priority
              onLoad={handleImageLoaded}
              onError={handleImageLoaded}
            />
          )}{" "}
          {loaded && !availableForSale && (
            <div className="absolute inset-0 z-10 bg-white/70 pointer-events-none" />
          )}
          {/* Badge Oferta, NEW o SIN STOCK */}
          {loaded &&
            (!availableForSale ? (
              <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 bg-background-fill-neutral-default body-02-semibold text-text-primary-invert pointer-events-none">
                SIN STOCK
              </div>
            ) : isOnSale ? (
              <div className="absolute bottom-3 left-3 z-20 p-1 bg-background-fill-danger-default body-02-semibold text-text-primary-invert pointer-events-none">
                {discountPercent}%
              </div>
            ) : isNew ? (
              <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 bg-background-fill-neutral-default body-02-semibold text-text-primary-invert pointer-events-none">
                NEW
              </div>
            ) : null)}
        </div>

        {/* Detalle */}
        <div className={`py-2 space-y-2 ${size === "small" ? "pl-4" : ""}`}>
          {!loaded ? (
            <>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-4 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : (
            <>
              {/* Título */}
              <h3 className="body-01-medium text-text-primary-default truncate whitespace-nowrap">
                {formattedTitle}{" "}
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
                          isWhite
                            ? "border border-border-secondary-default"
                            : ""
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
            </>
          )}
        </div>
      </Link>
      {/* Icono Favorito separado del enlace para evitar propagación */}
      <div className="absolute top-2 right-2 z-10">
        {loaded ? (
          <FavoriteButton productHandle={handle} />
        ) : (
          <Skeleton className="h-6 w-6 rounded-full" />
        )}{" "}
      </div>{" "}
    </div>
  );
}
