// src/components/common/Navbar.tsx

"use client";

import Link from "next/link";
import { ShoppingBagIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useEffect, useState } from "react";
import Logo from "@/assets/logo.svg"; // Asegúrate de que la ruta sea correcta

console.log("El logo es:", Logo); // <--- AÑADE ESTA LÍNEA

// Este componente ya es perfecto para el diseño, no necesita cambios.
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
      className="relative group p-2 transition-transform duration-300 ease-in-out hover:scale-110"
      aria-label={`Carrito de compras con ${totalQuantity} productos`}
    >
      <ShoppingBagIcon className="h-7 w-7 text-brand-foreground" />
      {isClient && totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}

// --- Componente principal de la Navbar (Versión Final Fiel al Diseño) ---
export function Navbar() {
  const { toggleMenu } = useUiStore();

  return (
    // CORRECCIÓN FINAL: Usamos los estilos de fondo y borde que se alinean con el diseño 'muñay'
    <header className="sticky top-0 z-40 bg-brand-background/90 backdrop-blur-sm border-b border-brand-foreground/10">
      <nav className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        {/* --- LADO IZQUIERDO: Ícono de Menú --- */}
        {/* Este botón ahora llama a tu store de UI, lo cual es perfecto. */}
        <button
          onClick={toggleMenu}
          className="p-2 text-brand-foreground transition-transform duration-300 ease-in-out hover:scale-110"
          aria-label="Abrir menú"
        >
          <Bars3Icon className="h-7 w-7" />
        </button>

        {/* --- CENTRO: Logo con Posicionamiento Absoluto --- */}
        {/* CORRECCIÓN FINAL: Volvemos al logo centrado, que es la clave del diseño. */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2"
          aria-label="Ir a la página de inicio"
        >
          <Logo className="h-10 w-auto text-brand-foreground" />
        </Link>

        {/* --- LADO DERECHO: Ícono del Carrito --- */}
        {/* CORRECCIÓN FINAL: Aquí solo debe estar el ícono del carrito para mantener la simetría y el minimalismo. */}
        <div className="flex items-center">
          <CartIcon />
        </div>

        {/* CORRECCIÓN FINAL: Se eliminó el <div> con los enlaces de navegación ("Home", "Productos", etc.).
            Esos enlaces NO pertenecen a la barra principal en este diseño. */}
      </nav>
    </header>
  );
}
