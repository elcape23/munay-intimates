"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutOptionsPage() {
  const { cart, isLoading } = useCartStore();
  const router = useRouter();

  if (isLoading && !cart) {
    return <div className="text-center p-12">Cargando...</div>;
  }

  if (!cart) {
    return <div className="text-center p-12">Tu carrito está vacío.</div>;
  }

  const handleOther = (method: string) => {
    alert(
      `Seleccionaste ${method}. Nos pondremos en contacto para finalizar tu compra.`
    );
  };

  return (
    <section className="mt-[55px] mx-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium">PAGO</h1>
      </div>
      <p className="body-02-regular">Elige un método de pago</p>
      <div className="grid grid-cols-2 flex-rows-2 gap-4">
        <Button
          onClick={() => handleOther("Efectivo")}
          variant="outline"
          size="lg"
          className="flex flex-col items-center"
        >
          <CurrencyDollarIcon className="h-6 w-6" />
          Efectivo
        </Button>
        <Button
          onClick={() => handleOther("Transferencia")}
          variant="outline"
          size="lg"
        >
          <BuildingLibraryIcon className="h-6 w-6" />
          Transferencia
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={cart.checkoutUrl}>Tarjeta de crédito</a>
        </Button>
      </div>
    </section>
  );
}
