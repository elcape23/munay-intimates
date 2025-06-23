// src/store/cartStore.ts

import { create } from "zustand";
import { getCart, createCart, addToCart, ShopifyCart } from "@/lib/shopify";

// Definimos la "forma" de nuestro estado
interface CartState {
  cart: ShopifyCart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItemToCart: (variantId: string) => Promise<void>;
}

// Creamos el store con zustand
export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: true,
  error: null,

  /**
   * Obtiene el carrito desde Shopify usando el ID guardado en localStorage,
   * o crea uno nuevo si no existe.
   */
  fetchCart: async () => {
    // ➡️ Si estamos en SSR, salimos para no usar localStorage
    if (typeof window === "undefined") return;
    set({ isLoading: true, error: null });
    try {
      let cart: ShopifyCart | null = null;
      let cartId = localStorage.getItem("cartId");

      if (cartId) {
        cart = await getCart(cartId);
        // Si el carrito fue eliminado o expiró en Shopify, creamos uno nuevo
        if (!cart) {
          cartId = null;
          localStorage.removeItem("cartId");
        }
      }

      if (!cartId) {
        cart = await createCart();
        localStorage.setItem("cartId", cart.id);
      }

      set({ cart: cart, isLoading: false });
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Ocurrió un error desconocido";
      set({ error: errorMessage, isLoading: false });
      console.error(e);
    }
  },

  /**
   * Añade un item al carrito.
   * @param variantId El ID de la variante del producto a añadir.
   */
  addItemToCart: async (variantId: string) => {
    let cartId = get().cart?.id;
    set({ isLoading: true, error: null });

    if (!cartId) {
      // Si por alguna razón no hay ID de carrito, intenta obtenerlo o crearlo.
      // Esto añade robustez al sistema.
      try {
        const newCart = await createCart();
        cartId = newCart.id;
        localStorage.setItem("cartId", cartId);
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "No se pudo crear el carrito.";
        set({ error: errorMessage, isLoading: false });
        return;
      }
    }

    try {
      const updatedCart = await addToCart(cartId, variantId, 1);
      set({ cart: updatedCart, isLoading: false });
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "No se pudo añadir el producto.";
      set({ error: errorMessage, isLoading: false });
      console.error(e);
    }
  },
}));

// Solo en el browser:
if (typeof window !== "undefined") {
  useCartStore.getState().fetchCart();
}
