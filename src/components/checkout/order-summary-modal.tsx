"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { ShopifyCart } from "@/lib/shopify";

interface OrderSummaryModalProps {
  open: boolean;
  onClose: () => void;
  cart: ShopifyCart;
  paymentMethod: string | null;
}

export function OrderSummaryModal({
  open,
  onClose,
  cart,
  paymentMethod,
}: OrderSummaryModalProps) {
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

  const shipping = parseFloat(cart.cost.totalAmount.amount) - subtotal;

  const showExtraDiscount =
    paymentMethod === "Efectivo" || paymentMethod === "Transferencia";
  const extraDiscount = showExtraDiscount ? subtotal * 0.25 : 0;

  const total = subtotal - extraDiscount + shipping;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-background-primary-default p-6 w-full max-w-sm space-y-4">
              <Dialog.Title className="body-01-medium">Resumen</Dialog.Title>
              <div className="space-y-2">
                <div className="flex justify-between body-02-regular">
                  <span>Productos</span>
                  <span>{formatPrice(productTotal)}</span>
                </div>
                <div className="flex justify-between body-02-regular">
                  <span>Envío</span>
                  <span>
                    {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <Dialog.Title className="body-01-medium">Descuentos</Dialog.Title>
              <div className="space-y-2">
                <div className="flex justify-between body-02-regular">
                  <span>Productos</span>
                  <span>-{formatPrice(productDiscount)}</span>
                </div>
                {showExtraDiscount && (
                  <div className="flex justify-between body-02-regular">
                    <span>25% OFF</span>
                    <span>-{formatPrice(extraDiscount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between body-01-medium pt-4 border-t border-border-secondary-default">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full" size="md" onClick={onClose}>
                Cerrar
              </Button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default OrderSummaryModal;
