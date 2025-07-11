"use client";

import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function CheckoutCashConfirmation() {
  const router = useRouter();

  return (
    <section className="pt-[55px] mx-6 min-h-[100vh] flex flex-col justify-between">
      <div className="flex flex-col items-center justify-start gap-3 mt-20">
        <CheckCircleIcon className="w-6 h-6 text-icon-success-default" />
        <h1 className="heading-06-regular text-text-primary-default">
          Gracias por tu compra en MUNAY
        </h1>
        <p className="body-01-regular text-text-primary-default">
          Tu pedido quedó reservado con el Nro. #000000000
        </p>
        <p className="body-01-regular text-text-primary-default">
          Comunicate con nosotras para coordinar el pago de la orden.
        </p>
      </div>
      <div className="mb-12 space-y-2">
        <Button asChild size="lg" className="w-full">
          <a
            href="https://wa.me/5493813638914"
            target="_blank"
            rel="noopener noreferrer"
          >
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
