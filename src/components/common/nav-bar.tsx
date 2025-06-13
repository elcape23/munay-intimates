// src/components/common/Navbar.tsx

"use client";

import Link from "next/link";
import { ShoppingBagIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useEffect, useState } from "react";
import Image from "@/assets/logo.svg";
// El componente CartIcon no necesita cambios
function CartIcon() {
  const { cart } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalQuantity = cart?.totalQuantity || 0;

  return (
    <Link
      href="/cart"
      className="relative group"
      aria-label={`Carrito de compras con ${totalQuantity} productos`}
    >
      <ShoppingBagIcon className="h-7 w-7 text-gray-600 group-hover:text-gray-900 transition-colors" />
      {isClient && totalQuantity > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}

// Componente principal de la Navbar
export function Navbar() {
  const { toggleMenu } = useUiStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Lado izquierdo: Ícono de Menú (móvil) y Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="md:hidden p-1"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-7 w-7 text-gray-600" />
          </button>
          <Link href="/" className="heading-01 text-gray-900">
            {/* …dentro del JSX… */}
            <Image
              src="/logo.svg" // ruta relativa a /public
              alt="Munay logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8" // respeta el tamaño; color se define en el SVG mismo
            />
          </Link>
        </div>

        {/* Centro: Enlaces de navegación (escritorio) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Todos los productos
          </Link>
          <Link
            href="/account"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Mi Cuenta
          </Link>
        </div>

        {/* Lado derecho: Ícono del Carrito */}
        <div className="flex items-center">
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}
