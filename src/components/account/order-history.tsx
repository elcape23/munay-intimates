// src/components/account/OrderHistory.tsx

"use client"; // ¡CRUCIAL! Esta línea debe estar al principio.

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getCustomerOrders, OrderLineItem, ShopifyOrder } from "@/lib/shopify";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formatProductTitle } from "@/lib/utils";

export function OrderHistory({
  statusFilter,
}: {
  statusFilter?: "en-proceso" | "entregados" | "cancelados";
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
      return !order.canceledAt && order.fulfillmentStatus !== "FULFILLED";
    }
    if (statusFilter === "entregados") {
      return order.fulfillmentStatus === "FULFILLED";
    }
    if (statusFilter === "cancelados") {
      return Boolean(order.canceledAt);
    }
    return true;
  });

  const getOrderStatus = (order: ShopifyOrder) => {
    if (order.canceledAt) return "Cancelado";
    if (order.fulfillmentStatus === "FULFILLED") return "Entregado";
    return "En proceso";
  };

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
          <div className="flex justify-between items-start mb-4 pb-3">
            <div className="flex flex-row justify-between w-full">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="-ml-4 body-01-semibold flex justify-between">
                    <span>Pedido #{order.orderNumber}</span>
                    <span className="body-02-regular text-text-secondary-default">
                      {getOrderStatus(order)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col justify-between space-y-2">
                      <p className="body-01-regular text-text-primary-default">
                        Realizado el:{" "}
                        {new Date(order.processedAt).toLocaleDateString(
                          "es-AR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="body-01-regular text-text-primary-default">
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
                      <p className="body-01-semibold pt-2">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: order.totalPrice.currencyCode,
                          maximumFractionDigits: 0,
                        }).format(parseFloat(order.totalPrice.amount))}
                      </p>
                    </div>
                    <div className="space-y-4">
                      {order.lineItems.edges.map(
                        (edge: { node: OrderLineItem }) => {
                          const item = edge.node;
                          if (!item.variant?.image) return null;

                          const talla = item.variant.selectedOptions?.find(
                            (o) =>
                              ["talle", "size", "talla"].includes(
                                o.name.toLowerCase()
                              )
                          )?.value;
                          const color = item.variant.selectedOptions?.find(
                            (o) => o.name.toLowerCase() === "color"
                          )?.value;

                          const formattedTitle = formatProductTitle(item.title);

                          return (
                            <div
                              key={item.variant.image.url + item.title}
                              className="flex items-center gap-4 pt-6"
                            >
                              <div className="relative w-40 h-40 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.variant.image.url}
                                  alt={
                                    item.variant.image.altText || formattedTitle
                                  }
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="self-stretch items-start justify-between pt-4 pb-6 space-y-6">
                                <p className="body-01-regular text-text-primary-default">
                                  {formattedTitle}{" "}
                                </p>
                                <div className="body-01-regular text-text-primary-default flex gap-1">
                                  {talla && <span>{talla}</span>} |{" "}
                                  {color && <span>{color}</span>}
                                </div>
                                <span className="body-02-regular text-text-primary-default">
                                  Cantidad: {item.quantity}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
