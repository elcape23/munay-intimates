// src/store/authStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  customerCreate,
  getCustomer,
  Customer,
  CustomerAccessToken,
} from "@/lib/shopify";

// Definimos la forma del estado de autenticación
interface AuthState {
  customer: Customer | null;
  customerAccessToken: CustomerAccessToken | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: any) => Promise<boolean>;
  signUp: (input: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Creamos el store con el middleware 'persist'
export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      customer: null,
      customerAccessToken: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      // Acción para iniciar sesión (¡LÓGICA CORREGIDA Y FINAL!)
      login: async (input) => {
        console.log("Login, input:", input);
        set({ isLoading: true, error: null });
        try {
          const response = await customerAccessTokenCreate(input);
          console.log("customerAccessTokenCreate response:", response);

          // Si la respuesta contiene un token, el login fue un éxito.
          if (response.customerAccessToken) {
            set({
              customerAccessToken: response.customerAccessToken,
              isLoggedIn: true, // Marcamos como logueado inmediatamente
              error: null,
            });
            console.log("customerUserErrors:", response.customerUserErrors);
            // Intentamos obtener los datos del cliente en segundo plano.
            // Si esto falla, checkAuthStatus lo manejará sin bloquear el login.
            get().checkAuthStatus();
            return true; // ¡Éxito!
          }

          // Si no hay token, es un error de credenciales.
          const errorMessage =
            response.customerUserErrors?.[0]?.message ||
            "El email o la contraseña son incorrectos.";
          set({ error: errorMessage });
          return false;
        } catch (e: any) {
          const errorMessage =
            e instanceof Error ? e.message : "Ocurrió un error desconocido.";
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Acción para registrar una nueva cuenta
      signUp: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const createResponse = await customerCreate(input);
          console.log("customerCreate response:", createResponse);

          if (createResponse.customer) {
            const tokenResponse = await customerAccessTokenCreate({
              email: input.email,
              password: input.password,
            });

            if (tokenResponse.customerAccessToken) {
              set({
                customerAccessToken: tokenResponse.customerAccessToken,
                customer: createResponse.customer,
                isLoggedIn: true,
                error: null,
              });
              get().checkAuthStatus();
              return true;
            }

            const tokenError =
              tokenResponse.customerUserErrors?.[0]?.message ||
              "El email o la contraseña son incorrectos.";
            set({ error: tokenError });
            return false;
          }

          const errorMessage =
            createResponse.customerUserErrors?.[0]?.message ||
            "No se pudo crear la cuenta.";
          set({ error: errorMessage });
          return false;
        } catch (e: any) {
          const errorMessage =
            e instanceof Error ? e.message : "Ocurrió un error desconocido.";
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Acción para cerrar sesión
      logout: async () => {
        const { customerAccessToken } = get();
        if (customerAccessToken) {
          try {
            await customerAccessTokenDelete(customerAccessToken.accessToken);
          } catch (e) {
            console.error("Error revoking token:", e);
          }
        }

        set({
          customer: null,
          customerAccessToken: null,
          isLoggedIn: false,
          isLoading: false,
          error: null,
        });
      },

      // Acción para verificar el estado de autenticación al cargar la app
      checkAuthStatus: async () => {
        const { customerAccessToken } = get();
        if (!customerAccessToken) {
          set({ isLoading: false });
          return;
        }

        try {
          const customer = await getCustomer(customerAccessToken.accessToken);
          if (customer) {
            set({ customer, isLoggedIn: true, isLoading: false, error: null });
          } else {
            await get().logout();
          }
        } catch (e) {
          console.error(e);
          await get().logout();
        }
      },
    }),
    {
      name: "customer-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

useAuthStore.getState().checkAuthStatus();
