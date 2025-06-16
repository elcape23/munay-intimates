// src/components/common/SideMenu.tsx (Ejemplo)

"use client";

import { useUiStore } from "@/store/ui-store";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Ícono para cerrar

export function SideMenu() {
  // El menú "escucha" el estado global de la UI
  const { isMenuOpen, closeMenu } = useUiStore();

  return (
    // El contenedor del menú se muestra u oculta basado en 'isMenuOpen'
    <div
      className={`fixed inset-0 z-50 bg-brand-background transform transition-transform duration-500 ease-in-out
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <button
          onClick={closeMenu} // Llama a la acción para cerrar el menú
          className="p-2 text-brand-foreground"
          aria-label="Cerrar menú"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>

      {/* AQUÍ VAN TUS ENLACES DE NAVEGACIÓN */}
      <nav className="flex flex-col items-center justify-center gap-8 mt-16">
        <Link
          onClick={closeMenu}
          href="/"
          className="text-3xl font-serif-display text-brand-foreground"
        >
          Home
        </Link>
        <Link
          onClick={closeMenu}
          href="/products"
          className="text-3xl font-serif-display text-brand-foreground"
        >
          Todos los productos
        </Link>
        <Link
          onClick={closeMenu}
          href="/account"
          className="text-3xl font-serif-display text-brand-foreground"
        >
          Mi Cuenta
        </Link>
      </nav>
    </div>
  );
}
