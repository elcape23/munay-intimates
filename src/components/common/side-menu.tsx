// src/components/common/SideMenu.tsx
"use client";

import { useState, useEffect } from "react";
import { useUiStore } from "@/store/ui-store";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getCollections, ShopifyCollection } from "@/lib/shopify";

export function SideMenu() {
  const { isMenuOpen, closeMenu } = useUiStore();
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);

  // Efecto para obtener las colecciones cuando el componente se monta
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const fetchedCollections = await getCollections();
        setCollections(fetchedCollections);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Menú</h2>
          <button onClick={closeMenu} aria-label="Cerrar menú">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-1">
          <Link
            href="/"
            onClick={closeMenu}
            className="p-3 rounded-md hover:bg-gray-100 text-gray-700 font-semibold"
          >
            Home
          </Link>
          <hr className="my-2" />
          <h3 className="px-3 py-2 text-sm font-semibold text-gray-500">
            Categorías
          </h3>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              onClick={closeMenu}
              className="p-3 rounded-md hover:bg-gray-100 text-gray-700"
            >
              {collection.title}
            </Link>
          ))}
          <hr className="my-2" />
          {/* ¡NUEVO! Enlace a la página de favoritos */}
          <Link
            href="/favorites"
            onClick={closeMenu}
            className="p-3 rounded-md hover:bg-gray-100 text-gray-700 font-semibold"
          >
            Favoritos
          </Link>
          <Link
            href="/account"
            onClick={closeMenu}
            className="p-3 rounded-md hover:bg-gray-100 text-gray-700 font-semibold"
          >
            Mi Cuenta
          </Link>
        </nav>
      </div>
    </>
  );
}
