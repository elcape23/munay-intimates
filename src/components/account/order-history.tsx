// src/components/account/OrderHistory.tsx

"use client"; // ¡CRUCIAL! Esta línea debe estar al principio.

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getCustomerOrders, OrderLineItem, ShopifyOrder } from "@/lib/shopify";
import Image from "next/image";

export function OrderHistory({
  statusFilter,
}: {
  statusFilter?: "en-proceso" | "entregadas" | "locales";
}) {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { customerAccessToken } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerAccessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedOrders = await getCustomerOrders(
          customerAccessToken.accessToken
        );
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error al obtener el historial de pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [customerAccessToken]);

  if (isLoading) {
    return <p className="text-gray-500">Cargando historial de pedidos...</p>;
  }

  const filteredOrders = orders.filter((order) => {
    if (!statusFilter) return true;
    if (statusFilter === "en-proceso") {
      return order.fulfillmentStatus !== "FULFILLED";
    }
    if (statusFilter === "entregadas") {
      return order.fulfillmentStatus === "FULFILLED";
    }
    if (statusFilter === "locales") {
      return !order.shippingAddress?.address1;
    }
    return true;
  });

  if (filteredOrders.length === 0) {
    return (
      <p className="body-01-regular text-text-secondary-default">
        Aún no has realizado ningún pedido.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {filteredOrders.map((order) => (
        <div key={order.id} className="">
          <div className="flex justify-between items-start mb-4 border-b pb-3">
            <div className="flex flex-col w-auto">
              <div className="flex flex-row justify-between">
                <h3 className="body-02-semibold text-text-primary-default">
                  Pedido #{order.orderNumber}
                </h3>
                <span
                  className={`body-02-semibold px-2 py-1 rounded-full ${
                    order.financialStatus === "PAID"
                      ? "bg-background-surface-success-default text-success-default"
                      : "bg-background-surface-warning-default text-warning-default"
                  }`}
                >
                  {order.financialStatus}
                </span>
              </div>
              <div className="flex flex-row justify-between">
                <p className="body-02-regular text-text-primary-default">
                  Realizado el:{" "}
                  {new Date(order.processedAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="body-02-semibold">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: order.totalPrice.currencyCode,
                    maximumFractionDigits: 0,
                  }).format(parseFloat(order.totalPrice.amount))}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="body-02-regular text-text-primary-default">
                  Llegada estimada:{" "}
                  {new Date(
                    new Date(order.processedAt).setDate(
                      new Date(order.processedAt).getDate() + 5
                    )
                  ).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="body-02-regular text-text-secondary-default">
                  $6.000
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {order.lineItems.edges.map((edge: { node: OrderLineItem }) => {
              const item = edge.node;
              if (!item.variant?.image) return null;

              const talla = item.variant.selectedOptions?.find((o) =>
                ["talle", "size", "talla"].includes(o.name.toLowerCase())
              )?.value;
              const color = item.variant.selectedOptions?.find(
                (o) => o.name.toLowerCase() === "color"
              )?.value;

              return (
                <div
                  key={item.variant.image.url + item.title}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-40 h-40 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.variant.image.url}
                      alt={item.variant.image.altText || item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="items-start pt-4 pb-6 space-y-6">
                    <p className="body-02-regular text-text-primary-default">
                      {item.title}
                    </p>
                    <div className="body-02-regular text-text-primary-default flex gap-1">
                      {talla && <span>{talla}</span>} |{" "}
                      {color && <span>{color}</span>}
                    </div>
                    <span>Cantidad: {item.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
