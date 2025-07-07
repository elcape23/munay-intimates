import { create } from "zustand";
import {
  getCollectionsForMenu,
  NavItem,
  hasNewSaleProducts,
  getNewestProductsFull,
} from "@/lib/shopify";
import { slugify } from "@/lib/utils";

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

      // --- Subcategorías con productos nuevos ---
      try {
        const newest = await getNewestProductsFull(250);
        const subSet = new Set<string>();
        newest.forEach((p) => {
          p.tags?.forEach((tag) => {
            const parts = tag.split(":");
            if (
              parts.length === 2 &&
              ["subcategoría", "subcategoria"].includes(
                parts[0].trim().toLowerCase()
              )
            ) {
              subSet.add(parts[1].trim());
            }
          });
        });

        const subItems: NavItem[] = Array.from(subSet).map((name) => ({
          id: `subcat-${slugify(name)}`,
          title: name.toUpperCase(),
          url: `/collections/new?subcategory=${slugify(name)}`,
          section: "new",
          isNew: true,
        }));

        items.push(...subItems);
      } catch (err) {
        console.error("Error cargando subcategorías nuevas", err);
      }
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
