import { create } from "zustand";
import { getCollectionsForMenu, NavItem } from "@/lib/shopify";

interface NavigationState {
  menuItems: NavItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  menuItems: [],
  isLoading: false,
  error: null,
  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await getCollectionsForMenu();
      set({ menuItems: items, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Error cargando menú",
        isLoading: false,
      });
    }
  },
}));

/* dispara la carga al iniciar la app */
useNavigationStore.getState().fetchMenu();
