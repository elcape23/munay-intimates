"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { getCustomer } from "@/lib/shopify";
import { OrderHistory } from "@/components/account/order-history";
import LoginForm from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  ShoppingBagIcon,
  HeartIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

export default function AccountPage() {
  // rawSession lo casteamos a any para saltarnos el TS
  const { data: rawSession } = useSession();
  const session = rawSession as any;
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.shopifyToken) {
      getCustomer(session.user.shopifyToken).then(setCustomer);
    }
  }, [session?.user?.shopifyToken]);

  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();

    // Abrimos la URL de login directamente en una nueva pestaña
    window.open(
      "/api/auth/signin/google?callbackUrl=/account",
      "_blank",
      "noopener"
    );
  };

  // 2) Si no hay session, mostramos botones de login
  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-10 px-6">
        <Button
          onClick={handleGoogle}
          className="w-full py-3 hover:bg-gray-50"
          variant="outline"
          size="md"
        >
          Continuar con Google
        </Button>
        <div className="flex w-full items-center gap-3">
          <hr className="flex-grow border-t border-border-secondary-default" />
          <p className="body-02-regular text-text-secondary-default">O</p>
          <hr className="flex-grow border-t border-border-secondary-default" />
        </div>
        <div className="w-full ">
          <LoginForm />
        </div>
      </div>
    );
  }

  // 4) Spinner mientras cargan los datos del customer
  if (customer === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-12">Cargando datos del cliente…</div>
      </div>
    );
  }

  // 5) Render final
  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-3">
      <div className="flex flex-row justify-between">
        <Button variant="ghost" size="icon">
          <ChevronLeftIcon></ChevronLeftIcon>
        </Button>
        <h1 className="body-01-medium text-text-primary-default uppercase">
          Mi Cuenta
        </h1>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row">
          <Avatar />
          <div className="flex flex-col">
            <div className="body-01-semibold">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="body-02-regular"> {customer.email}</div>
          </div>
        </div>
        <EllipsisHorizontalIcon className="w-6 h-6" />
      </div>
      <div className="max-w mx-auto">
        <div>
          <div className="lg:col-span-1">
            <div className="px-6 sticky top-28">
              <div className="space-y-3 text-sm"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 items-start gap-4 my-6">
            <Button
              variant="outline"
              size="lg"
              className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
            >
              <ShoppingBagIcon className="h-6 w-6"></ShoppingBagIcon>Compras
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
            >
              <HeartIcon className="h-6 w-6"></HeartIcon>Favoritos
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
            >
              <CurrencyDollarIcon className="h-6 w-6"></CurrencyDollarIcon>
              Métodos de Pago
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
            >
              <HomeIcon className="h-6 w-6"></HomeIcon>Direcciones
            </Button>
          </div>
        </div>
      </div>
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        variant="secondary"
        size="lg"
      >
        Cerrar Sesión
      </Button>
    </div>
  );
}
