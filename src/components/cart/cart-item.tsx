"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";
import type { ShopifyCart } from "@/lib/shopify";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type CartLine = ShopifyCart["lines"]["edges"][number]["node"];

// ✅ Nuevo: sólo necesitas la línea de carrito
export type CartItemProps = {
  line: CartLine;
};

export function CartItem({ line }: CartItemProps) {
  const [open, setOpen] = useState(false);
  // ✔️ Nuevo: ref para medir ancho de los botones
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  // ✔️ Nuevo: estado que guardará ese ancho
  const [slideAmt, setSlideAmt] = useState(0);
  // Nuevo: ref y estado para medir ancho completo del item
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [itemWidth, setItemWidth] = useState(0);
  // ✅ Importa tu store y extrae los métodos
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { toggleFavorite, favoriteHandles = [] } = useFavoritesStore();
  const isAlreadyFavorite = favoriteHandles.includes(
    line.merchandise.product.handle
  );

  // ✅ Mide ancho de los botones al montar
  useEffect(() => {
    const updateWidths = () => {
      if (buttonsRef.current) {
        setSlideAmt(buttonsRef.current.offsetWidth);
      }
      if (itemRef.current) {
        setItemWidth(itemRef.current.offsetWidth);
      }
    };

    updateWidths();

    const observer = new ResizeObserver(updateWidths);
    if (buttonsRef.current) observer.observe(buttonsRef.current);
    if (itemRef.current) observer.observe(itemRef.current);

    window.addEventListener("resize", updateWidths);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidths);
    };
  }, []);

  // ✅ Handlers internos usando el store
  const handleSave = () => {
    const isAlreadyFav = isAlreadyFavorite;
    toggleFavorite(line.merchandise.product.handle);
    if (!isAlreadyFav) {
      toast({ title: "¡Producto añadido a favoritos!" });
    }
  };
  const handleDelete = () => removeItem(line.id);
  const handleDecrease = () => {
    if (line.quantity > 1) {
      updateQuantity(line.id, line.quantity - 1);
    }
  };
  const handleIncrease = () => {
    const available = line.merchandise.quantityAvailable;
    if (available === undefined || line.quantity < available) {
      updateQuantity(line.id, line.quantity + 1);
    }
  };
  const handlers = useSwipeable({
    onSwipedLeft: (e) => {
      const traveled = Math.abs(e.deltaX) + (open ? slideAmt : 0);
      if (itemWidth && traveled >= itemWidth) {
        handleDelete();
      } else {
        setOpen(true);
      }
    },
    onSwipedRight: () => setOpen(false),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // merge the hook's ref with our own ref
  const swipeRef = (el: HTMLDivElement | null) => {
    handlers.ref(el);
    itemRef.current = el;
  };

  const precio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: line.merchandise.price.currencyCode,
    maximumFractionDigits: 0,
  }).format(parseFloat(line.merchandise.price.amount));

  const precioAnterior = line.merchandise.compareAtPrice
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: line.merchandise.compareAtPrice.currencyCode,
        maximumFractionDigits: 0,
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
      <motion.div
        className="relative overflow-hidden my-3"
        {...handlers}
        ref={swipeRef}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        layout
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Botones ocultos a la derecha */}
        <div ref={buttonsRef} className="absolute inset-y-0 right-0 flex">
          <Button
            onClick={handleSave}
            className={cn(
              "w-max px-8 body-02-semibold rounded-l-1",
              isAlreadyFavorite
                ? "bg-background-fill-neutral-tertiary text-text-primary-default"
                : "bg-background-fill-neutral-default text-text-primary-invert"
            )}
            variant="ghost"
          >
            {isAlreadyFavorite ? "Guardado" : "Guardar"}{" "}
          </Button>
          <Button
            onClick={handleDelete}
            className="w-max px-8 body-02-semibold bg-background-fill-danger-default text-text-primary-invert"
            variant="ghost"
          >
            Eliminar
          </Button>
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
              <Button
                onClick={handleDecrease}
                className="m-1"
                aria-label="disminuir cantidad"
                variant="ghost"
                size="icon"
                disabled={line.quantity <= 1}
              >
                <MinusIcon className="w-5 h-5 p-1 text-icon-primary-default" />
              </Button>
              <span className="body-02-regular text-center">
                {line.quantity}
              </span>
              <Button
                onClick={handleIncrease}
                className="m-1"
                aria-label="incrementar cantidad"
                variant="ghost"
                size="icon"
                disabled={
                  line.merchandise.quantityAvailable !== undefined &&
                  line.quantity >= line.merchandise.quantityAvailable
                }
              >
                <PlusIcon className="w-5 h-5 p-1 text-icon-primary-default" />
              </Button>
            </div>
            <Button
              onClick={handleDelete}
              className="my-2 mr-2 body-02-regular text-text-secondary-default hover:text-text-secondary-hover transition-colors"
              variant="ghost"
              size="text"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
