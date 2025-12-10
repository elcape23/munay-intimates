"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CustomerAddress } from "@/lib/shopify";

interface AddressSelectionModalProps {
  open: boolean;
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  onClose: () => void;
  onConfirm: (addressId: string) => void;
}

export function AddressSelectionModal({
  open,
  addresses,
  selectedAddressId,
  onClose,
  onConfirm,
}: AddressSelectionModalProps) {
  const [currentSelection, setCurrentSelection] = useState<string | null>(
    selectedAddressId
  );

  useEffect(() => {
    setCurrentSelection(selectedAddressId);
  }, [selectedAddressId]);

  const addressOptions = useMemo(
    () =>
      addresses.map((address) => ({
        id: address.id,
        label: [
          [address.firstName, address.lastName].filter(Boolean).join(" "),
          [address.address1, address.address2].filter(Boolean).join(" "),
          [address.city, address.province, address.zip]
            .filter(Boolean)
            .join(", "),
          address.country,
          address.phone,
        ]
          .filter(Boolean)
          .join(" | "),
      })),
    [addresses]
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center  ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-40" : "opacity-0"
        }`}
      />
      <div
        className={`relative w-screen max-w-none bg-background-primary-default p-6 pt-5 pb-10 border-t border-t-border-secondary-default space-y-6 transition-transform duration-300 transform ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-clarity-label="Cerrar selector de dirección"
          >
            {" "}
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="body-01-regular">Seleccionar dirección</h2>
          {addressOptions.length === 0 ? (
            <p className="body-02-regular text-text-secondary-default">
              No tienes direcciones guardadas.
            </p>
          ) : (
            <RadioGroup
              value={currentSelection || undefined}
              onValueChange={setCurrentSelection}
              className="space-y-4"
            >
              {addressOptions.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start space-x-3 rounded border border-border-secondary-default p-4"
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`address-${address.id}`}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`address-${address.id}`}
                    className="body-02-regular text-text-primary-default"
                  >
                    {address.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="pt-9">
          <Button
            onClick={() => {
              if (currentSelection) {
                onConfirm(currentSelection);
              }
            }}
            size="lg"
            className="w-full"
            disabled={!currentSelection}
            data-clarity-label="Confirmar dirección de envío"
          >
            {" "}
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
