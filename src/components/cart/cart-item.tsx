"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import type { ShopifyCart } from "@/lib/shopify";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";

type CartLine = ShopifyCart["lines"]["edges"][number]["node"];

// ✅ Nuevo: sólo necesitas la línea de carrito
export type CartItemProps = {
  line: CartLine;
};

export function CartItem({ line }: CartItemProps) {
  const [open, setOpen] = useState(false);
  // ✔️ Nuevo: ref para medir ancho de los botones
  const buttonsRef = useRef<HTMLDivElement>(null);
  // ✔️ Nuevo: estado que guardará ese ancho
  const [slideAmt, setSlideAmt] = useState(0);
  // ✅ Importa tu store y extrae los métodos
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  // Mostrar modal de guardado
  const [showSaved, setShowSaved] = useState(false);

  // ✅ Mide ancho de los botones al montar
  useEffect(() => {
    if (buttonsRef.current) {
      setSlideAmt(buttonsRef.current.offsetWidth);
    }
  }, []);

  // ✅ Handlers internos usando el store
  const handleSave = () => {
    toggleFavorite(line.merchandise.product.handle);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };
  const handleDelete = () => removeItem(line.id);
  const handleDecrease = () => updateQuantity(line.id, line.quantity - 1);
  const handleIncrease = () => updateQuantity(line.id, line.quantity + 1);
  const handlers = useSwipeable({
    onSwipedLeft: () => setOpen(true),
    onSwipedRight: () => setOpen(false),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const precio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: line.merchandise.price.currencyCode,
  }).format(parseFloat(line.merchandise.price.amount));

  const precioAnterior = line.merchandise.compareAtPrice
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: line.merchandise.compareAtPrice.currencyCode,
      }).format(parseFloat(line.merchandise.compareAtPrice.amount))
    : null;

  const talla = line.merchandise.selectedOptions.find((o) =>
    ["talle", "size", "talla"].includes(o.name.toLowerCase())
  )?.value;
  const color = line.merchandise.selectedOptions.find(
    (o) => o.name.toLowerCase() === "color"
  )?.value;

  const isNew = line.merchandise.product.tags.some(
    (t) => t.toLowerCase() === "new"
  );

  return (
    <>
      <div className="relative overflow-hidden my-3" {...handlers}>
        {/* Botones ocultos a la derecha */}
        <div ref={buttonsRef} className="absolute inset-y-0 right-0 flex">
          <button
            onClick={handleSave}
            className="w-max px-8 body-02-semibold bg-background-fill-neutral-default text-text-primary-invert"
          >
            Guardar
          </button>
          <button
            onClick={handleDelete}
            className="w-max px-8 body-02-semibold bg-background-fill-danger-default text-text-primary-invert"
          >
            Eliminar
          </button>
        </div>
        <div
          className="flex items-stretch gap-4 bg-background-primary-default transform transition-transform duration-200"
          style={{
            transform: open ? `translateX(-${slideAmt}px)` : "translateX(0)",
          }}
        >
          {/* … */}
          <div
            className="relative flex-1 rounded-[4px] overflow-hidden flex-shrink-0"
            style={{ aspectRatio: "3 / 4" }}
          >
            <Image
              src={line.merchandise.image.url}
              alt={line.merchandise.image.altText || ""}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col items-start justify-between gap-10 py-4">
            {isNew && (
              <p className="body-03-regular text-text-secondary-default uppercase">
                New
              </p>
            )}
            <div className="flex-1">
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                className="block body-02-regular text-text-primary-default hover:underline"
              >
                {line.merchandise.product.title}
              </Link>
              <div className="body-02-regular text-text-primary-default flex gap-1">
                {talla && <span>{talla}</span>} |{" "}
                {color && <span>{color}</span>}
              </div>
            </div>
            <div className="mt-1">
              {precioAnterior ? (
                <p className="body-02-semibold text-text-primary-default">
                  <span className="line-through text-text-secondary-default mr-2">
                    {precioAnterior}
                  </span>
                  {precio}
                </p>
              ) : (
                <p className="body-02-semibold text-text-primary-default">
                  {precio}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleDecrease}
                className="m-1"
                aria-label="disminuir cantidad"
              >
                <MinusIcon className="w-5 h-5 p-1 text-icon-primary-default" />
              </button>
              <span className="body-02-regular text-center">
                {line.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="m-1"
                aria-label="incrementar cantidad"
              >
                <PlusIcon className="w-5 h-5 p-1 text-icon-primary-default" />
              </button>
            </div>
            <button
              onClick={handleDelete}
              className="my-2 mr-2 body-02-regular text-text-secondary-default hover:text-text-secondary-hover transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
      {showSaved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-bacground-fill-neutral-default text-text-primary-invert px-4 py-2 rounded-[2px] z-50">
          Producto guardado con éxito
        </div>
      )}
    </>
  );
}
