"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getCustomerAddresses, CustomerAddress } from "@/lib/shopify";

export function AddressList() {
  const { customerAccessToken } = useAuthStore();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!customerAccessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const fetched = await getCustomerAddresses(
          customerAccessToken.accessToken
        );
        const unique = Array.from(
          new Map(fetched.map((addr) => [addr.id, addr])).values()
        );
        setAddresses(unique);
      } catch (e) {
        console.error("Error al obtener direcciones:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [customerAccessToken]);

  if (isLoading) {
    return (
      <p className="heading-06-regular text-text-secondary-default  ">
        Cargando direcciones...
      </p>
    );
  }

  if (addresses.length === 0) {
    return (
      <p className="body-01-regular text-text-secondary-default">
        No tienes direcciones guardadas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="space-y-2">
          <p className="body-02-regular text-text-primary-default uppercase">
            {addr.firstName} {addr.lastName}
          </p>
          {(addr.address1 || addr.address2) && (
            <p className="body-02-regular text-text-primary-default">
              {[addr.address1, addr.address2].filter(Boolean).join(" ")}{" "}
            </p>
          )}
          {addr.city && (
            <p className="body-02-regular text-text-primary-default">
              {addr.city}
            </p>
          )}
          {addr.province && (
            <p className="body-02-regular text-text-primary-default">
              {addr.province}
            </p>
          )}
          {addr.zip && (
            <p className="body-02-regular text-text-primary-default">
              {addr.zip}
            </p>
          )}{" "}
          {addr.phone && (
            <p className="body-02-regular text-text-primary-default">
              {addr.phone}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
