// src/components/common/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils"; // tu helper de clases condicionales

export function Navbar() {
  const { toggleMenu } = useUiStore();
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCartStore();
  const totalQuantity = cart?.totalQuantity ?? 0;

  useEffect(() => {
    const onScroll = () => {
      // activa scrolled cuando bajes más de 20px, ajústalo a tu gusto
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-in-out",
        scrolled
          ? "bg-background-primary-default" // sólido con un poco de opacidad
          : "bg-transparent" // transparente al top
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Menú hamburguesa */}
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={toggleMenu}
          className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring-primary"
        >
          <Bars3Icon
            className={cn(
              "h-6 w-6",
              scrolled
                ? "text-icon-primary-default"
                : "text-icon-primary-invert"
            )}
          />
        </button>

        {/* Logo brand */}
        <Link href="/" aria-label="Ir al home" className="flex items-center">
          {/* El SVG está en /public/munay-wordmark.svg */}
          <img
            src={cn(
              scrolled ? "/munay-wordmark.svg" : "/munay-wordmark-white.svg"
            )}
            alt="Logo Munay"
            className="h-auto w-[106px] "
            loading="eager"
          />
        </Link>

        {/* Icono carrito */}
        <Link
          href="/cart"
          aria-label={`Carrito de compras con ${totalQuantity} productos`}
          className="relative rounded-md focus:outline-none focus:ring-2 focus:ring-ring-primary"
        >
          <ShoppingBagIcon
            className={cn(
              "h-6 w-6 transition-colors",
              scrolled
                ? "text-icon-primary-default"
                : "text-icon-primary-invert"
            )}
          />
          {totalQuantity > 0 && (
            <span className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-status-error text-xs font-medium text-white">
              {totalQuantity}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
