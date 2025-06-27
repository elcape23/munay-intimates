// src/app/(pages)/cart/page.tsx

"use client"; // Esta página necesita ser un Client Component para interactuar con el store.

import { useCartStore } from "@/store/cart-store"; // ¡NUEVO! Importamos el store.
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  // Obtenemos todo el estado directamente desde nuestro store de Zustand.
  // ¡Ya no necesitamos useState ni useEffect para buscar el carrito aquí!
  const { cart, isLoading } = useCartStore();

  if (isLoading && !cart) {
    // Mostramos 'Cargando' solo la primera vez.
    return <div className="text-center p-12">Cargando carrito...</div>;
  }

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <main className="container mx-auto text-center p-12">
        <h1 className="body-02-regular text-text-primary-default mb-4">
          Tu carrito está vacío
        </h1>
        <Link href="/" className="text-blue-600 hover:underline font-semibold">
          Seguir comprando
        </Link>
      </main>
    );
  }

  return (
    <section className="mt-[55px] mx-6">
      {/* — HEADER: flecha  título */}
      <div className="flex items-center justify-between">
        <button onClick={() => window.history.back()}>
          <ChevronLeftIcon className="w-6 h-6 text-black" />
        </button>
        <h1 className="body-01-medium">CARRITO</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        {/* — Lista de productos (cada tarjeta según PDF página 1) */}
        <div className="lg:col-span-2 space-y-6">
          {cart.lines.edges.map(({ node: line }) => (
            <CartItem
              key={line.id}
              line={line}
              onSave={() => console.log("save", line.id)}
              onDelete={() => console.log("delete", line.id)}
            />
          ))}
        </div>
        {/* — Resumen del pedido (PDF página 2) */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white rounded-lg shadow sticky top-28">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Resumen del Pedido
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{/* mismo Intl.NumberFormat de arriba */}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span>Calculado en el checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3 mt-4">
              <span>Total</span>
              <span>{/* mismo Intl.NumberFormat */}</span>
            </div>
            {/* Botón fijo “Continuar” según diseño */}
            <a
              href={cart.checkoutUrl}
              className="block mt-6 w-full py-3 bg-black text-white text-center rounded hover:bg-gray-800 transition"
            >
              Continuar {/** mostrar total aquí **/}
            </a>
            <p className="text-xs text-gray-500 mt-2 text-center">
              No incluye envío
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
