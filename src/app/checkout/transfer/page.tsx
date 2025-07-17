"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import LoginForm from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function CheckoutTransferPage() {
  const router = useRouter();
  const { isLoggedIn, customer } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const createdRef = useRef(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createOrder = async () => {
      if (
        !isLoggedIn ||
        !customer ||
        !cart ||
        orderId ||
        loading ||
        createdRef.current
      )
        return;
      createdRef.current = true;
      setLoading(true);
      try {
        const res = await fetch("/api/create-pending-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart,
            customerId: customer?.id,
            note: "Pago por transferencia",
            tags: ["transferencia"],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error");
        setOrderId(data.id);
        clearCart();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo crear la orden.");
      } finally {
        setLoading(false);
      }
    };
    createOrder();
  }, [isLoggedIn, cart, customer]);
  if (!isLoggedIn) {
    return (
      <section className="pt-[55px] mx-6">
        <h1 className="body-01-medium mb-6">Inicia sesión o crea una cuenta</h1>
        <LoginForm
          redirectOnSuccess={false}
          registerReturnUrl="/checkout/transfer"
        />{" "}
      </section>
    );
  }

  return (
    <section className="pt-[55px] mx-6 min-h-[100vh] flex flex-col justify-between">
      <div className="flex flex-col items-start justify-start gap-3 mt-14 text-left">
        {orderId ? (
          <>
            <CheckCircleIcon className="w-6 h-6 text-icon-success-default" />
            <div>
              <h1 className="heading-06-regular text-text-primary-default">
                Tu orden está pendiente
              </h1>
              <p className="body-01-regular text-text-secondary-default">
                Número de orden: {orderId}
              </p>
            </div>
            <div className="body-01-regular text-text-primary-default space-y-1 my-4">
              <p className="body-01-regular text-text-primary-default underline">
                Datos para transferencia
              </p>
              <p className="body-01-regular text-text-primary-default">
                CBU: 0000000000000000
                <br />
                Alias: munayintimates.mp
                <br /> Nombre: Victoria Manso
                <br />
                CUIT: 00-00000000-0
              </p>
            </div>
            <p className="body-01-regular text-text-primary-default">
              Cuando realices la transferencia por favor compartinos el
              comprobante para enviarte el pedido.
            </p>
          </>
        ) : (
          <p className="body-01-regular">
            {loading ? "Generando orden..." : error}
          </p>
        )}
      </div>
      <div className="mb-12 space-y-2">
        <Button asChild size="lg" className="w-full">
          <a
            href="https://wa.me/5493813638914"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="w-6 h-6" />
            Compartir Comprobante
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/")}
        >
          Seguir Comprando
        </Button>
      </div>
    </section>
  );
}
