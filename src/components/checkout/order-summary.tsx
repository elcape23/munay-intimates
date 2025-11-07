"use client";

import { ShopifyCart } from "@/lib/shopify";

interface OrderSummaryProps {
  cart: ShopifyCart;
  paymentMethod: string | null;
  shippingCost?: number | null;
}

export default function OrderSummary({
  cart,
  paymentMethod,
  shippingCost,
}: OrderSummaryProps) {
  const currency = cart.cost.totalAmount.currencyCode;

  const productTotal = cart.lines.edges.reduce((sum, { node }) => {
    if (node.merchandise.quantityAvailable === 0) return sum;
    const price = parseFloat(
      node.merchandise.compareAtPrice?.amount || node.merchandise.price.amount
    );
    return sum + price * node.quantity;
  }, 0);

  const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
  const productDiscount = productTotal - subtotal;

  const shipping =
    shippingCost != null
      ? shippingCost
      : parseFloat(cart.cost.totalAmount.amount) - subtotal;
  const showExtraDiscount =
    paymentMethod === "Efectivo" || paymentMethod === "Transferencia";
  const paymentMethodDiscount = showExtraDiscount ? subtotal * 0.25 : 0;

  const total = subtotal - paymentMethodDiscount + shipping;
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="pt-6 w-full px-4 space-y-4">
      <div className="space-y-2">
        <h2 className="body-01-semibold">Resumen</h2>
        <div className="space-y-1">
          <div className="flex justify-between body-02-regular">
            <span>Productos</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="flex justify-between body-02-regular">
            <span>Envío</span>
            <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="body-01-semibold">Descuentos</h2>
        <div className="space-y-1">
          <div className="flex justify-between body-02-regular">
            <span>Productos</span>
            <span>-{formatPrice(productDiscount)}</span>
          </div>
          {showExtraDiscount && (
            <div className="flex justify-between body-02-regular">
              <span>25% OFF</span>
              <span>-{formatPrice(paymentMethodDiscount)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between body-01-bold pt-2">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
