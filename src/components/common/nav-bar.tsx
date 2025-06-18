// src/components/common/Navbar.tsx

"use client";

import Link from "next/link";
import { Bars3Icon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  className?: string;
}

/**
 * Barra de navegación principal del Design System Munay.
 * El logo se sirve como imagen estática desde `/public` para evitar configuraciones adicionales.
 */
export function Navbar({ className }: NavbarProps) {
  const { toggleMenu } = useUiStore();
  const { cart } = useCartStore();
  const totalQuantity = cart?.totalQuantity ?? 0;

  return (
    <header
      className={cn(
        "flex h-12 w-full items-center justify-between bg-background-transparent px-6 py-2",
        className
      )}
    >
      {/* Botón hamburguesa */}
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={toggleMenu}
        className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring-primary"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Logo brand */}
      <Link href="/" aria-label="Ir al home" className="flex items-center">
        {/* El SVG está en /public/munay-wordmark.svg */}
        <img
          src="/munay-wordmark.svg"
          alt="Logo Munay"
          className="h-auto w-[106px]"
          loading="eager"
        />
      </Link>

      {/* Icono carrito */}
      <Link
        href="/cart"
        aria-label={`Carrito de compras con ${totalQuantity} productos`}
        className="relative rounded-md focus:outline-none focus:ring-2 focus:ring-ring-primary"
      >
        <ShoppingBagIcon className="h-6 w-6" />
        {totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-status-error text-xs font-medium text-white">
            {totalQuantity}
          </span>
        )}
      </Link>
    </header>
  );
}

Navbar.displayName = "Navbar";

export default Navbar;
