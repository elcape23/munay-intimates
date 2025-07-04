// src/store/uiStore.ts
import { create } from "zustand";

// Definimos la forma del estado de la UI
interface UiState {
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

// Creamos el store para manejar el estado del menú lateral
export const useUiStore = create<UiState>((set) => ({
  isMenuOpen: false,
  isSearchOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
