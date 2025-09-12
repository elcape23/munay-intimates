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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/store/auth-store";
import {
  CustomerAddress,
  getCustomerAddresses,
  updateCartBuyerIdentity,
} from "@/lib/shopify";
import { DeliveryDateModal } from "@/components/checkout/delivery-date-modal";

export default function CheckoutOptionsPage() {
  const { cart, isLoading } = useCartStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { customerAccessToken } = useAuthStore();
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(
    null
  );

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] =
    useState<string>("Envío a Domicilio");
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryDateLabel, setDeliveryDateLabel] = useState("Mañana");
  const [deliveryTime, setDeliveryTime] = useState("10hs a 13hs");
  useEffect(() => {
    const fetchAddress = async () => {
      if (!customerAccessToken) return;
      const { addresses, defaultAddressId } = await getCustomerAddresses(
        customerAccessToken.accessToken
      );
      const chosen =
        addresses.find((addr) => addr.id === defaultAddressId) ||
        addresses[0] ||
        null;
      setDefaultAddress(chosen);
    };
    fetchAddress();
  }, [customerAccessToken]);

  useEffect(() => {
    const fetchShipping = async () => {
      if (!defaultAddress) return;
      try {
        const res = await fetch("/api/shipping-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryCode: defaultAddress.countryCode,
            provinceCode: defaultAddress.provinceCode,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (typeof json.price === "number") {
            setShippingCost(json.price);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchShipping();
  }, [defaultAddress]);

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

  const handleContinue = async () => {
    if (!selectedMethod) return;
    if (typeof window !== "undefined") {
      const cost = shippingMethod === "Retiro de Tienda" ? 0 : shippingCost;
      sessionStorage.setItem("shippingMethod", shippingMethod);
      sessionStorage.setItem("shippingCost", cost != null ? String(cost) : "");
      sessionStorage.setItem("deliveryDate", deliveryDateLabel);
      sessionStorage.setItem("deliveryTime", deliveryTime);
      if (defaultAddress) {
        const addressForOrder = {
          address1: defaultAddress.address1,
          address2: defaultAddress.address2,
          city: defaultAddress.city,
          province: defaultAddress.province,
          provinceCode: defaultAddress.provinceCode,
          country: defaultAddress.country,
          countryCode: defaultAddress.countryCode,
          zip: defaultAddress.zip,
          firstName: defaultAddress.firstName,
          lastName: defaultAddress.lastName,
          phone: defaultAddress.phone,
        };
        sessionStorage.setItem(
          "defaultAddress",
          JSON.stringify(addressForOrder)
        );
      } else {
        sessionStorage.removeItem("defaultAddress");
      }
    }
    if (selectedMethod === "Tarjeta de crédito") {
      // `router.push` trataría esta URL externa como una ruta interna de
      // Next.js y provocaría un 404. Usamos `window.location.assign` para
      // redirigir al checkout de Shopify correctamente.
      if (customerAccessToken) {
        try {
          const updatedCart = await updateCartBuyerIdentity(
            cart.id,
            customerAccessToken.accessToken
          );
          window.location.assign(updatedCart.checkoutUrl);
          return;
        } catch (e) {
          console.error(e);
        }
      }
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

  const effectiveShippingCost =
    shippingMethod === "Retiro de Tienda" ? 0 : shippingCost;

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
          defaultValue={["payment", "shipping-method", "shipping"]}
          className="space-y-6"
        >
          <AccordionItem value="payment">
            <AccordionTrigger>Seleccionar método de pago</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 flex-rows-2 gap-4">
                  <Button
                    onClick={() => handleOther("Efectivo")}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "body-02-semibold flex flex-col items-start text-left space-y-1 p-4 pb-6",
                      selectedMethod === "Efectivo" &&
                        "ring-[1px] ring-offset-[0px] ring-border-primary-default"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <CurrencyDollarIcon className="h-6 w-6" />
                      <span className="rounded border border-warning-default bg-background-fill-warning-default px-2 py-1 body-03-semibold text-text-primary-invert">
                        25% OFF
                      </span>
                    </div>{" "}
                    Efectivo
                  </Button>
                  <Button
                    onClick={() => handleOther("Transferencia")}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "body-02-semibold flex flex-col items-start text-left space-y-1 p-4 pb-6",
                      selectedMethod === "Transferencia" &&
                        "ring-[1px] ring-offset-[0px] ring-border-primary-default"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <BuildingLibraryIcon className="h-6 w-6" />
                      <span className="rounded border border-warning-default bg-background-fill-warning-default px-2 py-1 body-03-semibold text-text-primary-invert">
                        25% OFF
                      </span>
                    </div>{" "}
                    Transferencia
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleCard}
                    className={cn(
                      "body-02-semibold flex flex-col items-start text-left space-y-1 p-4 pb-6",
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
          <AccordionItem value="shipping-method">
            <AccordionTrigger>Método de envío</AccordionTrigger>
            <AccordionContent>
              <div className="p-4">
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Envío a Domicilio"
                      id="envio-domicilio"
                      className="h-4 w-4 border-border-primary-default text-primary"
                    />
                    <label
                      htmlFor="envio-domicilio"
                      className="body-02-regular"
                    >
                      Envío a Domicilio
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Retiro de Tienda"
                      id="retiro-tienda"
                      className="h-4 w-4 border-border-primary-default text-primary"
                    />
                    <label htmlFor="retiro-tienda" className="body-02-regular">
                      Retiro de Tienda
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Detalles de envío</AccordionTrigger>
            <AccordionContent>
              <div className="p-4 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="body-01-semibold">Dirección</p>
                    <Button variant="link" size="text" onClick={() => {}}>
                      Cambiar
                    </Button>
                  </div>
                  <p className="body-02-regular text-text-secondary-default pr-20">
                    {shippingMethod === "Retiro de Tienda"
                      ? "Retiro de Tienda"
                      : addressString}{" "}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="body-01-semibold">Fecha de envío</p>
                    <Button
                      variant="link"
                      size="text"
                      onClick={() => setIsDeliveryModalOpen(true)}
                    >
                      {" "}
                      Cambiar
                    </Button>
                  </div>
                  <p className="body-02-regular text-text-secondary-default">
                    {deliveryDateLabel} - {deliveryTime}{" "}
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
        <OrderSummary
          cart={cart}
          paymentMethod={selectedMethod}
          shippingCost={effectiveShippingCost}
        />{" "}
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
      <DeliveryDateModal
        open={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onConfirm={(date, time) => {
          setDeliveryDateLabel(date);
          setDeliveryTime(time);
        }}
      />
    </section>
  );
}
