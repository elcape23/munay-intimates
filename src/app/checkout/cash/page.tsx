"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import LoginForm from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function CheckoutCashPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { cart } = useCartStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createOrder = async () => {
      if (!isLoggedIn || !cart || orderId || loading) return;
      setLoading(true);
      try {
        const res = await fetch("/api/create-pending-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart,
            note: "Pago en efectivo",
            tags: ["efectivo"],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error");
        setOrderId(data.id);
      } catch (e) {
        setError("No se pudo crear la orden.");
      } finally {
        setLoading(false);
      }
    };
    createOrder();
  }, [isLoggedIn, cart]);
  if (!isLoggedIn) {
    return (
      <section className="pt-[55px] mx-6">
        <h1 className="body-01-medium mb-6">Inicia sesión o crea una cuenta</h1>
        <LoginForm redirectOnSuccess={false} />
      </section>
    );
  }

  return (
    <section className="pt-[55px] mx-6 min-h-[100vh] flex flex-col justify-between">
      <div className="flex flex-col items-start justify-start gap-3 mt-20 text-left">
        {orderId ? (
          <>
            <CheckCircleIcon className="w-6 h-6 text-icon-success-default" />
            <h1 className="heading-06-regular text-text-primary-default">
              Gracias por tu compra en MUNAY
            </h1>
            <p className="body-01-regular text-text-primary-default">
              Tu pedido quedó reservado con el Nro. #{orderId}
            </p>
            <p className="body-01-regular text-text-primary-default">
              Comunicate con nosotras para coordinar el pago de la orden.
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
            Enviar WhatsApp
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
