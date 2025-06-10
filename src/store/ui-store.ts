// src/store/uiStore.ts
import { create } from "zustand";

// Definimos la forma del estado de la UI
interface UiState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

// Creamos el store para manejar el estado del menú lateral
export const useUiStore = create<UiState>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}));
