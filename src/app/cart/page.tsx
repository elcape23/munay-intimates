// src/app/(pages)/cart/page.tsx

"use client"; // Esta página necesita ser un Client Component para interactuar con el store.

import { useCartStore } from "@/store/cart-store"; // ¡NUEVO! Importamos el store.
import Link from "next/link";
import Image from "next/image";

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
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <Link href="/" className="text-blue-600 hover:underline font-semibold">
          Seguir comprando
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cart.lines.edges.map(({ node: line }) => (
            <div
              key={line.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={line.merchandise.image.url}
                  alt={
                    line.merchandise.image.altText ||
                    line.merchandise.product.title
                  }
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex-grow">
                <Link
                  href={`/products/${line.merchandise.product.handle}`}
                  className="font-semibold hover:underline"
                >
                  {line.merchandise.product.title}
                </Link>
                <p className="text-sm text-gray-600">
                  {line.merchandise.title}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Cantidad: {line.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: line.cost.totalAmount.currencyCode,
                  }).format(parseFloat(line.cost.totalAmount.amount))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-white shadow-sm sticky top-28">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3">
              Resumen del Pedido
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: cart.cost.subtotalAmount.currencyCode,
                  }).format(parseFloat(cart.cost.subtotalAmount.amount))}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Envío</span>
                <span>Calculado en el checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: cart.cost.totalAmount.currencyCode,
                }).format(parseFloat(cart.cost.totalAmount.amount))}
              </span>
            </div>
            <a
              href={cart.checkoutUrl}
              target="_blank" // Buena práctica para no perder el contexto de la tienda
              rel="noopener noreferrer"
              className="block w-full text-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
            >
              Finalizar Compra
            </a>
            <p className="text-xs text-center text-gray-500 mt-2">
              Serás redirigido al checkout seguro.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
