import { create } from "zustand";
import {
  getCollectionsForMenu,
  NavItem,
  hasNewSaleProducts,
} from "@/lib/shopify";

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
      const newSale = await hasNewSaleProducts();
      items.push({
        id: "special-prices",
        title: "SPECIAL PRICES",
        url: "/special-prices",
        section: "categories",
        isNew: newSale,
      });
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
// Solo en el browser para evitar esperar a la petición en el servidor
if (typeof window !== "undefined") {
  useNavigationStore.getState().fetchMenu();
}
