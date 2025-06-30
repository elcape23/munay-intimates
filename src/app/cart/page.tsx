// src/app/(pages)/cart/page.tsx

"use client"; // Esta página necesita ser un Client Component para interactuar con el store.

import { useCartStore } from "@/store/cart-store"; // ¡NUEVO! Importamos el store.
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

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
      <section className="flex flex-col h-screen items-center justify-center text-center mx-auto text-center p-12">
        <div className="">
          <h1 className="heading-06-regular text-text-primary-default my-4">
            Tu carrito está vacío
          </h1>
          <Link
            href="/"
            className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    );
  }

  const SHIPPING_FLAT_RATE = 1500;

  const currency = cart.cost.subtotalAmount.currencyCode;
  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const shipping = SHIPPING_FLAT_RATE;
  const total = subtotal;
  const grandTotal = subtotal + shipping;
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
      value
    );

  return (
    <>
      <section className="mt-[55px] mx-6">
        {/* — HEADER: flecha  título */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="icon"
          >
            <ChevronLeftIcon className="w-6 h-6 text-black" />
          </Button>
          <h1 className="body-01-medium">CARRITO</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 items-start mt-6">
          {/* — Lista de productos (cada tarjeta según PDF página 1) */}
          <div className="lg:col-span-2 space-y-6">
            {cart.lines.edges.map(({ node: line }) => (
              <CartItem key={line.id} line={line} />
            ))}
          </div>
          {/* — Resumen del pedido (PDF página 2) */}
          <div className="flex flex-row">
            <div className="flex-1 bg-white rounded-lg shadow sticky bottom-1 hidden">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-4">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Envío</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              {/* Botón fijo “Continuar” según diseño */}
              <Button>
                <a
                  href={cart.checkoutUrl}
                  className="block mt-6 w-full py-3 bg-black text-white text-center rounded hover:bg-gray-800 transition"
                >
                  Continuar - {formatPrice(grandTotal)}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 left-0 w-screen h-10 bg-background-primary-default border-t border-gray-200 z-50 flex items-center justify-between px-4 sm:hidden">
        <a
          href={cart.checkoutUrl}
          className="body-02-semibold py-1 px-4 bg-black text-white rounded mr-2"
        >
          Continuar
        </a>
        <div className="flex flex-col items-end">
          <p className="body-02-semibold text-text-primary-default">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: cart.cost.totalAmount.currencyCode,
            }).format(parseFloat(cart.cost.totalAmount.amount))}
          </p>
          <p className="text-[10px] leading-none text-text-secondary-default">
            <span>+ {formatPrice(shipping)} de envío</span>
          </p>
        </div>
      </div>
    </>
  );
}
