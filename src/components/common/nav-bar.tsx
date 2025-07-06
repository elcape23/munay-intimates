// src/components/common/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import {
  XMarkIcon,
  Bars3Icon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  alwaysDark?: boolean;
  alwaysLight?: boolean;
  onNavigate?: () => void;
  searchMode?: boolean;
}

export function Navbar({
  alwaysDark = false,
  alwaysLight = false,
  onNavigate,
  searchMode = false,
}: NavbarProps) {
  const path = usePathname();
  const router = useRouter();
  const isHome = path === "/";
  const isProduct = path.startsWith("/products/");
  const { toggleMenu } = useUiStore();
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCartStore();
  const totalQuantity = cart?.totalQuantity ?? 0;
  const controls = useAnimation();
  const prevQuantity = useRef(totalQuantity);

  useEffect(() => {
    if (totalQuantity > prevQuantity.current) {
      controls.start({ scale: [1, 1.3, 1], transition: { duration: 0.3 } });
    }
    prevQuantity.current = totalQuantity;
  }, [totalQuantity, controls]);

  useEffect(() => {
    if (alwaysDark || alwaysLight) return;
    const onScroll = () => {
      // activa scrolled cuando bajes más de 20px, ajústalo a tu gusto
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysDark, alwaysLight]);

  // Handler: abre menú o vuelve atrás
  const handleMenuOrBack = () => {
    onNavigate?.();
    if (searchMode) return;
    if (isProduct) {
      router.back();
    } else {
      toggleMenu();
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-in-out",
        {
          "bg-transparent":
            !alwaysDark && !alwaysLight && ((isHome && !scrolled) || isProduct),
          "bg-background-primary-default":
            alwaysLight ||
            (!alwaysDark && (!isHome || scrolled) && (!isProduct || scrolled)),
          "bg-background-fill-neutral-default": alwaysDark,
        }
      )}
    >
      <div className="max-w-7xl h-[55px] mx-auto flex items-center justify-between px-6 py-3">
        {/* Menú hamburguesa */}
        <Button
          aria-label={isProduct || searchMode ? "Cerrar" : "Abrir menú"}
          onClick={handleMenuOrBack}
          className="rounded-md focus-visible:outline-none focus-visible:ring-0"
          variant="ghost"
          size="icon"
        >
          {" "}
          {isProduct || searchMode ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon
              className={cn("h-6 w-6", {
                "text-icon-primary-invert":
                  alwaysDark || (!alwaysLight && isHome && !scrolled),
                "text-icon-primary-default":
                  alwaysLight || (!alwaysDark && (!isHome || scrolled)),
              })}
            />
          )}
        </Button>

        {/* Logo brand */}
        {(!isProduct || scrolled || alwaysDark || alwaysLight) && (
          <Link
            href="/"
            aria-label="Ir al home"
            className="flex items-center"
            onClick={onNavigate}
          >
            {/* El SVG está en /public/munay-wordmark.svg */}
            <img
              src={
                alwaysLight
                  ? "/munay-wordmark.svg"
                  : alwaysDark || (isHome && !scrolled)
                  ? "/munay-wordmark-white.svg"
                  : "/munay-wordmark.svg"
              }
              alt="Logo Munay"
              className="h-auto w-[106px]"
              loading="eager"
            />
          </Link>
        )}

        {/* Icono carrito */}
        <Link
          href="/cart"
          aria-label={`Carrito de compras con ${totalQuantity} productos`}
          className="relative rounded-md focus-visible:outline-none focus-visible:ring-0"
          onClick={onNavigate}
        >
          <ShoppingBagIcon
            className={cn("h-6 w-6 transition-colors", {
              "text-icon-primary-invert":
                alwaysDark || (!alwaysLight && isHome && !scrolled),
              "text-icon-primary-default":
                alwaysLight || (!alwaysDark && (!isHome || scrolled)),
            })}
          />
          {totalQuantity > 0 && (
            <motion.span
              animate={controls}
              className="absolute -right-1 -top-1 flex items-center justify-center rounded-full body-03-medium bg-background-fill-neutral-default text-text-primary-invert w-4 h-4"
            >
              {totalQuantity}
            </motion.span>
          )}
        </Link>
      </div>
    </motion.nav>
  );
}
