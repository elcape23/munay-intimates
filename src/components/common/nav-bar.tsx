// src/components/common/Navbar.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import {
  XMarkIcon,
  Bars3Icon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useNavigationStore } from "@/store/navigation-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const POPULAR_NAV_KEYWORDS = [
  "ROPA INTERIOR",
  "PIJAMA",
  "LOUNGE",
  "SPECIAL PRICES",
  "DEPORT",
  "ACCESOR",
  "BODY",
  "CONJUNTO",
  "BOMBACHA",
  "CORPI",
  "BÁSICO",
  "BASICO",
  "OFERTA",
  "SALE",
] as const;

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
  const { toggleMenu, openSearch } = useUiStore();
  const [scrolled, setScrolled] = useState(false);
  const { cart } = useCartStore();
  const totalQuantity = cart?.totalQuantity ?? 0;
  const controls = useAnimation();
  const prevQuantity = useRef(totalQuantity);
  const { menuItems } = useNavigationStore();

  const desktopMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.section !== "collections" && !item.id.startsWith("subcat-")
      ),
    [menuItems]
  );

  const popularDesktopMenuItems = useMemo(() => {
    const filtered = menuItems.filter(
      (item) => item.section !== "collections" && !item.id.startsWith("subcat-")
    );

    const withPriority = filtered.map((item, index) => {
      const normalizedTitle = item.title.toUpperCase();
      const priority = POPULAR_NAV_KEYWORDS.findIndex((keyword) =>
        normalizedTitle.includes(keyword)
      );

      return { item, index, priority };
    });

    withPriority.sort((a, b) => {
      if (a.priority === -1 && b.priority === -1) {
        return a.index - b.index;
      }
      if (a.priority === -1) return 1;
      if (b.priority === -1) return -1;
      if (a.priority === b.priority) {
        return a.index - b.index;
      }
      return a.priority - b.priority;
    });

    return withPriority.slice(0, 4).map(({ item }) => item);
  }, [menuItems]);

  const useInvertedColors = alwaysDark || (!alwaysLight && isHome && !scrolled);

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
      let canNavigateBack = false;
      if (typeof window !== "undefined") {
        const historyLength = window.history.length;
        const referrer =
          typeof document !== "undefined" ? document.referrer : "";
        const isInternalReferrer =
          referrer !== "" && referrer.startsWith(window.location.origin);
        canNavigateBack = historyLength > 1 || isInternalReferrer;
      }

      if (canNavigateBack) {
        router.back();
      } else {
        router.push("/");
      }
    } else {
      toggleMenu();
    }
  };

  const shouldShowLogo = !(
    isProduct &&
    !scrolled &&
    !alwaysDark &&
    !alwaysLight
  );

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        delay: isHome ? 0.3 : 0,
      }}
      className={cn(
        "fixed inset-x-0 z-40 transition-all duration-700 ease-in-out",
        isHome ? "top-8" : "top-0",
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
      <div className="h-[55px] mx-auto grid grid-cols-[auto,1fr,auto] items-center px-6 py-3 lg:px-32 lg:h-[72px] lg:grid-cols-[auto,1fr,auto] lg:items-center lg:gap-8">
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Menú hamburguesa */}
          <Button
            aria-label={isProduct || searchMode ? "Cerrar" : "Abrir menú"}
            onClick={handleMenuOrBack}
            className={cn(
              "rounded-md focus-visible:outline-none focus-visible:ring-0",
              {
                "lg:hidden": !searchMode && !isProduct,
              }
            )}
            variant="ghost"
            size="icon"
            data-clarity-label={
              isProduct || searchMode ? "Cerrar menú o búsqueda" : "Abrir menú"
            }
          >
            {isProduct || searchMode ? (
              <XMarkIcon
                className={cn("w-6 h-6", {
                  "text-icon-primary-invert": useInvertedColors,
                  "text-icon-primary-default": !useInvertedColors,
                })}
                data-clarity-label="Cerrar menú o búsqueda"
              />
            ) : (
              <Bars3Icon
                data-clarity-label="Abrir menú"
                className={cn("h-6 w-6", {
                  "text-icon-primary-invert": useInvertedColors,
                  "text-icon-primary-default": !useInvertedColors,
                })}
              />
            )}
          </Button>

          {/* Logo brand */}
          {shouldShowLogo && (
            <Link
              href="/"
              aria-label="Ir al home"
              className="hidden lg:flex items-center"
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
        </div>

        {shouldShowLogo && (
          <div className="col-start-2 flex items-center justify-center lg:hidden">
            <Link
              href="/"
              aria-label="Ir al home"
              className="flex items-center"
              onClick={onNavigate}
            >
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
          </div>
        )}

        {!searchMode && popularDesktopMenuItems.length > 0 && (
          <div className="hidden lg:flex items-center justify-center gap-8 overflow-x-auto no-scrollbar px-2 lg:col-start-2">
            {" "}
            {popularDesktopMenuItems.map((item) => {
              const isActive =
                item.url === "/"
                  ? path === item.url
                  : path.startsWith(item.url);
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={onNavigate}
                  className={cn(
                    "uppercase body-01-regular transition-all whitespace-nowrap",
                    useInvertedColors
                      ? "text-text-primary-invert hover:opacity-80"
                      : "text-text-secondary-default hover:text-brand-primary",
                    {
                      "text-text-primary-default":
                        isActive && !useInvertedColors,
                      "text-text-primary-invert": isActive && useInvertedColors,
                      "text-text-danger-default":
                        item.id === "special-prices" && !useInvertedColors,
                    }
                  )}
                >
                  {item.title}
                  {item.isNew && (
                    <span className="ml-1 body-03-regular tracking-normal align-super">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="col-start-3 flex items-center gap-2 justify-end lg:gap-2">
          {" "}
          {!searchMode && (
            <>
              <button
                type="button"
                onClick={() => {
                  onNavigate?.();
                  openSearch();
                }}
                className={cn(
                  "hidden lg:flex items-center gap-3 pb-1 border-b body-02-regular uppercase transition-colors pl-2 pr-10",
                  useInvertedColors
                    ? "border-border-primary-invert text-text-primary-invert hover:opacity-80"
                    : "border-border-primary-default text-text-secondary-default hover:text-text-primary-default hover:border-border-primary-hover"
                )}
              >
                <span>Search</span>
              </button>

              <Link
                href="/favorites"
                onClick={onNavigate}
                aria-label="Ver favoritos"
                className={cn(
                  "hidden lg:inline-flex rounded-md focus-visible:outline-none focus-visible:ring-0 transition-colors",
                  useInvertedColors
                    ? "text-icon-primary-invert hover:opacity-80"
                    : "text-icon-primary-default hover:text-brand-primary"
                )}
              >
                <HeartIcon className="h-6 w-6" />
              </Link>

              <Link
                href="/account"
                onClick={onNavigate}
                aria-label="Ir a mi cuenta"
                className={cn(
                  "hidden lg:inline-flex rounded-md focus-visible:outline-none focus-visible:ring-0 transition-colors",
                  useInvertedColors
                    ? "text-icon-primary-invert hover:opacity-80"
                    : "text-icon-primary-default hover:text-brand-primary"
                )}
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            </>
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
                "text-icon-primary-invert": useInvertedColors,
                "text-icon-primary-default": !useInvertedColors,
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
      </div>
    </motion.nav>
  );
}
