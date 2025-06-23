// src/components/common/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bars3Icon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils"; // tu helper de clases condicionales

export function Navbar() {
  const path = usePathname();
  const isHome = path === "/";
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
        {
          "bg-transparent": isHome && !scrolled,
          "bg-background-primary-default": !isHome || scrolled,
        }
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
            className={cn("h-6 w-6", {
              "text-icon-primary-invert": isHome && !scrolled,
              "text-icon-primary-default": !isHome || scrolled,
            })}
          />
        </button>

        {/* Logo brand */}
        <Link href="/" aria-label="Ir al home" className="flex items-center">
          {/* El SVG está en /public/munay-wordmark.svg */}
          <img
            src={cn({
              "/munay-wordmark-white.svg": isHome && scrolled,
              "/munay-wordmark.svg": !isHome || scrolled,
            })}
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
            className={cn("h-6 w-6 transition-colors", {
              "text-icon-primary-invert": isHome && !scrolled,
              "text-icon-primary-default": !isHome || scrolled,
            })}
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
