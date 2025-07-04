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
import { Footer } from "@/components/common/footer";

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
    alert(
      `Seleccionaste ${method}. Nos pondremos en contacto para finalizar tu compra.`
    );
  };

  const handleCard = () => {
    setSelectedMethod("Tarjeta de crédito");
  };

  return (
    <section className="mt-[55px] mx-6 min-h-screen flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium">MÉTODO DE PAGO</h1>
        </div>
        <p className="body-01-regular">Seleccionar método de pago</p>
        <div className="grid grid-cols-2 flex-rows-2 gap-4">
          <Button
            onClick={() => handleOther("Efectivo")}
            variant="outline"
            size="lg"
            className={cn(
              "body-02-semibold flex flex-col items-start text-left space-y-1",
              selectedMethod === "Efectivo" && "!border-2"
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
              selectedMethod === "Transferencia" && "!border-2"
            )}
          >
            <BuildingLibraryIcon className="h-6 w-6" />
            Transferencia
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            onClick={handleCard}
            className={cn(
              "body-02-semibold flex flex-col items-start text-left space-y-1",
              selectedMethod === "Tarjeta de crédito" && "!border-2"
            )}
          >
            <a href={cart.checkoutUrl}>
              <CreditCardIcon className="h-6 w-6" />
              Tarjeta de crédito
            </a>
          </Button>
        </div>
      </div>
      <Footer />
    </section>
  );
}
