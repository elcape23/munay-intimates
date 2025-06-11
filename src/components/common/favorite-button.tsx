// src/components/common/FavoriteButton.tsx

"use client";

import { useFavoritesStore } from "@/store/favorites-store";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

type FavoriteButtonProps = {
  productHandle: string;
};

export function FavoriteButton({ productHandle }: FavoriteButtonProps) {
  // Obtenemos todo el estado que necesitamos, incluida la bandera de hidratación.
  // ¡MODIFICADO! Si favoriteHandles es undefined, usamos un array vacío como fallback.
  const {
    toggleFavorite,
    favoriteHandles = [],
    _hasHydrated,
  } = useFavoritesStore();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Nos aseguramos de que la función exista antes de llamarla.
    if (toggleFavorite) {
      toggleFavorite(productHandle);
    }
  };

  // ¡CLAVE! No renderizamos el botón interactivo hasta que el store
  // nos confirme que ha cargado los datos desde la memoria del navegador.
  if (!_hasHydrated) {
    // Mostramos un placeholder para evitar saltos en la interfaz.
    return <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />;
  }

  // Una vez que el store está cargado, podemos comprobar de forma segura si el producto es favorito.
  const isProductFavorite = favoriteHandles.includes(productHandle);

  return (
    <button
      onClick={handleToggle}
      aria-label={
        isProductFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
      }
      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
    >
      {isProductFavorite ? (
        <HeartIconSolid className="h-6 w-6 text-red-500" />
      ) : (
        <HeartIconOutline className="h-6 w-6 text-gray-500" />
      )}
    </button>
  );
}
