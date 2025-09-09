"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import OrderSummary from "@/components/checkout/order-summary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/store/auth-store";
import { CustomerAddress, getCustomerAddresses } from "@/lib/shopify";

export default function CheckoutOptionsPage() {
  const { cart, isLoading } = useCartStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { customerAccessToken } = useAuthStore();
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(
    null
  );

  useEffect(() => {
    const fetchAddress = async () => {
      if (!customerAccessToken) return;
      const addresses = await getCustomerAddresses(
        customerAccessToken.accessToken
      );
      setDefaultAddress(addresses[0] || null);
    };
    fetchAddress();
  }, [customerAccessToken]);

  const addressString = defaultAddress
    ? defaultAddress.formatted?.join(", ") ||
      [
        defaultAddress.address1,
        defaultAddress.city,
        defaultAddress.province,
        defaultAddress.zip,
      ]
        .filter(Boolean)
        .join(", ")
    : "Sin dirección";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium">CHECKOUT</h1>
        </div>
        <Accordion
          type="multiple"
          defaultValue={["payment", "shipping"]}
          className="pt-6 space-y-4"
        >
          <AccordionItem value="payment">
            <AccordionTrigger>Seleccionar método de pago</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-4">
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Detalles de envío</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="body-01-semibold">Dirección</p>
                    <Button variant="link" size="text" onClick={() => {}}>
                      Cambiar
                    </Button>
                  </div>
                  <p className="body-02-regular text-text-secondary-default pr-20">
                    {addressString}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="body-01-semibold">Fecha de envío</p>
                    <Button variant="link" size="text" onClick={() => {}}>
                      Cambiar
                    </Button>
                  </div>
                  <p className="body-02-regular text-text-secondary-default">
                    Mañana
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="body-01-semibold">Instrucciones de envío</p>
                    <Button variant="link" size="text" onClick={() => {}}>
                      Cambiar
                    </Button>
                  </div>
                  <p className="body-02-regular text-text-secondary-default">
                    Detalles
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <OrderSummary cart={cart} paymentMethod={selectedMethod} />
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
