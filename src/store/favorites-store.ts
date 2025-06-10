// src/store/favoritesStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProductsByHandles, ShopifyProduct } from "@/lib/shopify";

// Definimos la nueva forma del estado
interface FavoritesState {
  favoriteHandles: string[];
  favoriteProducts: ShopifyProduct[];
  isLoading: boolean;
  _hasHydrated: boolean;

  toggleFavorite: (handle: string) => void;
  fetchFavoriteProducts: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useFavoritesStore = create(
  persist<FavoritesState>(
    (set, get) => ({
      favoriteHandles: [],
      favoriteProducts: [],
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      toggleFavorite: (handle) => {
        const { favoriteHandles } = get();
        const isAlreadyFavorite = favoriteHandles.includes(handle);

        const newFavoriteHandles = isAlreadyFavorite
          ? favoriteHandles.filter((h) => h !== handle)
          : [...favoriteHandles, handle];

        set({ favoriteHandles: newFavoriteHandles });
        // Después de cambiar la lista, volvemos a buscar los productos para mantener todo sincronizado.
        get().fetchFavoriteProducts();
      },

      fetchFavoriteProducts: async () => {
        const { favoriteHandles } = get();
        if (favoriteHandles.length === 0) {
          set({ favoriteProducts: [], isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const products = await getProductsByHandles(favoriteHandles);
          set({ favoriteProducts: products, isLoading: false });
        } catch (error) {
          console.error("Error al obtener productos favoritos:", error);
          set({ isLoading: false, favoriteProducts: [] });
        }
      },
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
      // ¡CORRECCIÓN CLAVE! Hemos eliminado la línea 'partialize' que causaba el error de TypeScript.
      // Ahora se guardará todo el estado, lo cual es más simple y seguro.
      onRehydrateStorage: (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Al cargar la app, si ya hay favoritos guardados, los buscamos.
useFavoritesStore.subscribe((state, prevState) => {
  // Nos aseguramos de buscar los productos solo una vez, justo después de que el estado se carga desde la memoria.
  if (state._hasHydrated && !prevState._hasHydrated) {
    state.fetchFavoriteProducts();
  }
});
