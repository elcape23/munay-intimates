"use client";
// src/components/common/FavoriteButton.tsx

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useFavoritesStore } from "@/store/favorites-store";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
    setHasHydrated,
  } = useFavoritesStore();

  const controls = useAnimation();

  // Asegura que la bandera de hidratación se active incluso si no había datos guardados
  useEffect(() => {
    if (!_hasHydrated) {
      setHasHydrated(true);
    }
  }, [_hasHydrated, setHasHydrated]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    controls.start({ scale: [1, 1.3, 1], transition: { duration: 0.3 } });
    const isAlreadyFavorite = favoriteHandles.includes(productHandle);
    // Nos aseguramos de que la función exista antes de llamarla.
    if (toggleFavorite) {
      toggleFavorite(productHandle);
      if (!isAlreadyFavorite) {
        toast({ title: "¡Producto añadido a favoritos!" });
      }
    }
  };

  // ¡CLAVE! No renderizamos el botón interactivo hasta que el store
  // nos confirme que ha cargado los datos desde la memoria del navegador.
  if (!_hasHydrated) {
    // Mostramos un placeholder para evitar saltos en la interfaz.
    return <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />;
  }

  // Una vez que el store está cargado, podemos comprobar de forma segura si el producto es favorito.
  const isProductFavorite = favoriteHandles.includes(productHandle);

  return (
    <Button
      asChild
      onClick={handleToggle}
      aria-label={
        isProductFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
      }
      className="text-icon-primary-default hover:transition-colors"
      variant="ghost"
      size="icon"
    >
      <motion.button animate={controls}>
        {isProductFavorite ? (
          <HeartIconSolid className="h-6 w-6 text-icon-primary-default" />
        ) : (
          <HeartIconOutline className="h-6 w-6 text-icon-primary-default" />
        )}
      </motion.button>
    </Button>
  );
}
