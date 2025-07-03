// src/app/(pages)/cart/page.tsx

"use client"; // Esta página necesita ser un Client Component para interactuar con el store.

import { useCartStore } from "@/store/cart-store"; // ¡NUEVO! Importamos el store.
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/common/footer";
import Image from "next/image";

export default function CartPage() {
  // Obtenemos todo el estado directamente desde nuestro store de Zustand.
  // ¡Ya no necesitamos useState ni useEffect para buscar el carrito aquí!
  const { cart, isLoading } = useCartStore();
  const [showEmpty, setShowEmpty] = useState(false);
  const prevCount = useRef<number>(0);

  const lineCount = cart?.lines?.edges?.length || 0;

  useEffect(() => {
    if (lineCount === 0) {
      if (prevCount.current > 0) {
        const timeout = setTimeout(() => setShowEmpty(true), 500);
        return () => clearTimeout(timeout);
      } else {
        setShowEmpty(true);
      }
    } else {
      setShowEmpty(false);
    }
    prevCount.current = lineCount;
  }, [lineCount]);

  if (isLoading && !cart) {
    // Mostramos 'Cargando' solo la primera vez.
    return <div className="text-center p-12">Cargando carrito...</div>;
  }

  if (!cart || showEmpty) {
    return (
      <section className="container mx-auto mt-[55px] px-6 justify-between min-h-screen flex flex-col">
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
        <div className="flex flex-col items-center">
          <Image
            src="/illustrations/cart-empty.svg"
            alt="Carrito vacío"
            width={240}
            height={240}
            className="mb-4"
          />
          <h1 className="heading-06-regular text-text-primary-default mb-6 text-center">
            Tu carrito está vacío
          </h1>
          <Link
            href="/"
            className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
          >
            Seguir comprando
          </Link>
        </div>
        <Footer />
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
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

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
            <AnimatePresence initial={false}>
              {cart.lines?.edges?.map(({ node: line }) => (
                <CartItem key={line.id} line={line} />
              ))}
            </AnimatePresence>
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
              <Button asChild value="primary" size="lg">
                <Link href="/checkout">
                  Continuar - {formatPrice(grandTotal)}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 left-0 w-screen h-auto bg-background-primary-default border-t border-border-secondary-default z-50 flex items-center justify-between px-6 pt-3 pb-9 sm:hidden">
        <Button asChild value="primary" size="lg" className="w-1/2">
          <Link href="/checkout">Continuar</Link>
        </Button>
        <div className="flex flex-col items-end gap-1">
          <p className="body-01-medium text-text-primary-default">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: cart.cost.totalAmount.currencyCode,
              maximumFractionDigits: 0,
            }).format(parseFloat(cart.cost.totalAmount.amount))}
          </p>
          <p className="body-02-regular leading-none text-text-secondary-default">
            <span>Envío en checkout</span>
          </p>
        </div>
      </div>
    </>
  );
}
