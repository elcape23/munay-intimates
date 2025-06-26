"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import type { ShopifyCart } from "@/lib/shopify";

type CartLine = ShopifyCart["lines"]["edges"][number]["node"];

type Props = {
  line: CartLine; // el tipo que usas en tu page.tsx
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
};

export function CartItem({ line, onSave, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => setOpen(true),
    onSwipedRight: () => setOpen(false),
    trackMouse: true,
  });

  const precio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: line.cost.totalAmount.currencyCode,
  }).format(parseFloat(line.cost.totalAmount.amount));

  // Opciones (e.g. “S | Negro”) vienen en el title de la variante
  const opts = line.merchandise.title;

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Botones ocultos a la derecha */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => onSave(line.id)}
          className="w-16 bg-black text-white flex items-center justify-center"
        >
          Guardar
        </button>
        <button
          onClick={() => onDelete(line.id)}
          className="w-16 bg-red-600 text-white flex items-center justify-center"
        >
          Eliminar
        </button>
      </div>

      {/* Contenido deslizable */}
      <div
        className={`flex items-start gap-4 p-4 bg-white rounded-lg shadow transform transition-transform duration-200 ${
          open ? "-translate-x-32" : "translate-x-0"
        }`}
      >
        {/* Imagen 3:4 */}
        <div
          className="relative w-24 rounded-md overflow-hidden flex-shrink-0"
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
        <div className="flex-1">
          <p className="text-xs text-text-secondary-default">New Season</p>
          <Link
            href={`/products/${line.merchandise.product.handle}`}
            className="block text-lg font-semibold hover:underline"
          >
            {line.merchandise.product.title}
          </Link>
          <p className="text-sm text-text-secondary-default mt-1">{opts}</p>
          <p className="text-lg font-semibold mt-2">{precio}</p>
        </div>
      </div>
    </div>
  );
}
