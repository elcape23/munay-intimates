"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import LoginForm from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { trackPurchase } from "@/lib/analytics";
import { trackClarityEvent } from "@/lib/clarity";

export default function CheckoutTransferPage() {
  const router = useRouter();
  const { isLoggedIn, customer } = useAuthStore();
  const { cart, clearCart, fetchCart } = useCartStore();
  const createdRef = useRef(false);
  const isMountedRef = useRef(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const readSessionStorage = useCallback((key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }, []);

  const createOrder = useCallback(async () => {
    if (!isLoggedIn || !customer || !cart || orderId || createdRef.current)
      return;
    createdRef.current = true;
    if (isMountedRef.current) {
      setError(null);
      setLoading(true);
    }
    try {
      const shippingMethod = readSessionStorage("shippingMethod");
      const shippingCostStr = readSessionStorage("shippingCost");
      const shippingCost = shippingCostStr
        ? parseFloat(shippingCostStr)
        : undefined;
      const shippingAddressStr = readSessionStorage("defaultAddress");
      let shippingAddress: unknown;
      if (shippingAddressStr) {
        try {
          shippingAddress = JSON.parse(shippingAddressStr);
        } catch (err) {
          console.warn("No se pudo parsear la dirección de envío", err);
        }
      }
      const deliveryDate = readSessionStorage("deliveryDate");
      const deliveryTime = readSessionStorage("deliveryTime");
      const noteParts = ["Pago por transferencia"];
      if (deliveryDate) noteParts.push(`Fecha: ${deliveryDate}`);
      if (deliveryTime) noteParts.push(`Horario: ${deliveryTime}`);
      const note = noteParts.join(" - ");
      const res = await fetch("/api/create-pending-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customerId: customer?.id,
          note,
          tags: ["transferencia"],
          shippingMethod,
          shippingCost,
          shippingAddress,
        }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error("La respuesta del servidor no es válida");
      }
      if (!res.ok) throw new Error(data?.error || "No se pudo crear la orden");
      if (isMountedRef.current) {
        setOrderId(data.id);
      }
      if (customer?.phone) {
        const orderTotal =
          parseFloat(cart.cost.totalAmount.amount) + (shippingCost ?? 0);
        fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: customer.phone,
            orderId: data.id,
            paymentMethod: "transferencia",
            name: customer.firstName,
            orderTotal,
          }),
        }).catch((err) =>
          console.warn("No se pudo enviar el WhatsApp de confirmación", err)
        );
      }
      if (cart) {
        const items = cart.lines.edges.map(({ node }) => ({
          item_name: node.merchandise.product.title,
          item_id: node.merchandise.sku || node.merchandise.id,
          price: parseFloat(node.merchandise.price.amount),
          quantity: node.quantity,
        }));
        trackPurchase(
          data.id,
          parseFloat(cart.cost.totalAmount.amount),
          cart.cost.totalAmount.currencyCode,
          items
        );
        trackClarityEvent("purchase_completed", {
          order_id: data.id,
          value: parseFloat(cart.cost.totalAmount.amount),
          currency: cart.cost.totalAmount.currencyCode,
          payment_method: "Transferencia",
        });
      }
      clearCart();
      try {
        await fetchCart();
      } catch (err) {
        console.warn("No se pudo recrear el carrito luego de la orden", err);
      }
    } catch (e) {
      createdRef.current = false;
      if (isMountedRef.current) {
        setError(e instanceof Error ? e.message : "No se pudo crear la orden.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    cart,
    clearCart,
    customer,
    fetchCart,
    isLoggedIn,
    orderId,
    readSessionStorage,
  ]);

  useEffect(() => {
    void createOrder();
  }, [createOrder]);

  const handleRetry = useCallback(() => {
    if (loading) return;
    createdRef.current = false;
    void createOrder();
  }, [createOrder, loading]);
  if (!isLoggedIn) {
    return (
      <section className="pt-[55px] mx-6">
        <h1 className="body-01-medium mb-6">Inicia sesión o crea una cuenta</h1>
        <LoginForm
          redirectOnSuccess={false}
          registerReturnUrl="/checkout/transfer"
        />
      </section>
    );
  }

  return (
    <section className="pt-[55px] mx-6 min-h-[100vh] mb-12 flex flex-col justify-between">
      <div
        className={`flex flex-col gap-3 text-left ${
          loading
            ? "items-center justify-center flex-1"
            : "items-start justify-start mt-14"
        }`}
      >
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
                CBU: 0000184305000007087298
                <br />
                Alias: intimatesmunay
                <br /> Nombre: Victoria Manso
                <br />
                CUIT: 27-39977095-0
              </p>
            </div>
            <p className="body-01-regular text-text-primary-default">
              Cuando realices la transferencia por favor compartinos el
              comprobante para enviarte el pedido.
            </p>
          </>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <LoadingSpinner />
            <p className="body-01-regular">Generando orden...</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="body-01-regular text-left">{error}</p>
            <Button onClick={handleRetry} size="lg">
              Reintentar
            </Button>
          </div>
        )}
      </div>
      <div className="mb-16 space-y-2">
        <Button
          asChild
          variant="primary"
          size="lg"
          className="w-full"
          data-clarity-label="Compartir comprobante por WhatsApp"
        >
          <a
            href="https://wa.me/5493813638914"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
            aria-label="Compartir comprobante por WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="w-6 h-6" />
            Compartir comprobante
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/")}
          data-clarity-label="Volver a comprar"
        >
          Seguir Comprando
        </Button>
      </div>
    </section>
  );
}
