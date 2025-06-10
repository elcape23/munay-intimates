// src/components/account/OrderHistory.tsx

"use client"; // ¡CRUCIAL! Esta línea debe estar al principio.

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getCustomerOrders, OrderLineItem, ShopifyOrder } from "@/lib/shopify";
import Image from "next/image";

export function OrderHistory() {
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

  if (orders.length === 0) {
    return <p className="text-gray-500">Aún no has realizado ningún pedido.</p>;
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-4 border-b pb-3">
            <div>
              <h3 className="font-semibold">Pedido #{order.orderNumber}</h3>
              <p className="text-sm text-gray-500">
                Realizado el:{" "}
                {new Date(order.processedAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: order.totalPrice.currencyCode,
                }).format(parseFloat(order.totalPrice.amount))}
              </p>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  order.financialStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.financialStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {order.lineItems.edges.map((edge: { node: OrderLineItem }) => {
              const item = edge.node;
              if (!item.variant?.image) return null;

              return (
                <div
                  key={item.variant.image.url + item.title}
                  className="flex items-center gap-4"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.variant.image.url}
                      alt={item.variant.image.altText || item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
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
