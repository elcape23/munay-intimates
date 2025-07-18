"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutOptionsPage() {
  const { cart, isLoading } = useCartStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (isLoading && !cart) {
    return <div className="text-center p-12">Cargando...</div>;
  }

  if (!cart) {
    return <div className="text-center p-12">Tu carrito está vacío.</div>;
  }

  const handleOther = (method: string) => {
    setSelectedMethod(method);
  };

  const handleCard = () => {
    setSelectedMethod("Tarjeta de crédito");
  };

  const handleContinue = () => {
    if (!selectedMethod) return;
    if (selectedMethod === "Tarjeta de crédito") {
      // `router.push` trataría esta URL externa como una ruta interna de
      // Next.js y provocaría un 404. Usamos `window.location.assign` para
      // redirigir al checkout de Shopify correctamente.
      window.location.assign(cart.checkoutUrl);
    } else if (selectedMethod === "Efectivo") {
      router.push("/checkout/cash");
    } else if (selectedMethod === "Transferencia") {
      router.push("/checkout/transfer");
    } else {
      alert(
        `Seleccionaste ${selectedMethod}. Nos pondremos en contacto para finalizar tu compra.`
      );
    }
  };

  return (
    <section className="pt-[55px] mx-6 min-h-[calc(100vh-55px)] flex flex-col justify-between">
      {" "}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium">MÉTODO DE PAGO</h1>
        </div>
        <div className="pt-6 space-y-4">
          <p className="body-01-regular">Seleccionar método de pago</p>
          <div className="grid grid-cols-2 flex-rows-2 gap-4">
            <Button
              onClick={() => handleOther("Efectivo")}
              variant="outline"
              size="lg"
              className={cn(
                "body-02-semibold flex flex-col items-start text-left space-y-1",
                selectedMethod === "Efectivo" &&
                  "ring-[1px] ring-offset-[0px] ring-border-primary-default"
              )}
            >
              <CurrencyDollarIcon className="h-6 w-6" />
              Efectivo
            </Button>
            <Button
              onClick={() => handleOther("Transferencia")}
              variant="outline"
              size="lg"
              className={cn(
                "body-02-semibold flex flex-col items-start text-left space-y-1",
                selectedMethod === "Transferencia" &&
                  "ring-[1px] ring-offset-[0px] ring-border-primary-default"
              )}
            >
              <BuildingLibraryIcon className="h-6 w-6" />
              Transferencia
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleCard}
              className={cn(
                "body-02-semibold flex flex-col items-start text-left space-y-1",
                selectedMethod === "Tarjeta de crédito" &&
                  "ring-[1px] ring-offset-[0px] ring-border-primary-default"
              )}
            >
              <CreditCardIcon className="h-6 w-6" />
              Tarjeta de crédito
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!selectedMethod}
          className="w-full mb-10"
        >
          Continuar
        </Button>
      </div>
    </section>
  );
}
