"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getCustomer } from "@/lib/shopify";
import LoginForm from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ShoppingBagIcon,
  HeartIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { Footer } from "@/components/common/footer";
import { ConfirmModal } from "@/components/common/confirm-modal";
import Image from "next/image";

export default function AccountPage() {
  // rawSession lo casteamos a any para saltarnos el TS
  const { data: rawSession } = useSession();
  const session = rawSession as any;
  const router = useRouter();
  const [customer, setCustomer] = useState<any | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      if (!session?.user?.shopifyToken) return;
      setCustomerLoading(true);
      setCustomerError(null);
      try {
        const data = await getCustomer(session.user.shopifyToken);
        if (data) {
          setCustomer(data);
        } else {
          setCustomer(null);
          setCustomerError("No se pudo cargar la información del cliente.");
        }
      } catch (e) {
        console.error("Error fetching customer:", e);
        setCustomer(null);
        setCustomerError("No se pudo cargar la información del cliente.");
      } finally {
        setCustomerLoading(false);
      }
    }
    fetchCustomer();
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (e) {
      console.error("Error signing out:", e);
      setIsSigningOut(false);
    }
  };

  const openLogoutConfirm = () => setShowLogoutConfirm(true);
  const closeLogoutConfirm = () => setShowLogoutConfirm(false);

  const handleEditClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoadingEdit(true);
    router.push("/account/edit");
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
          <Image src="/icons/google.svg" alt="google" width={24} height={24} />
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
  if (customerLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <LoadingSpinner />
        <p className="body-02-regular text-text-primary-default">
          Cargando datos del cliente…
        </p>
      </div>
    );
  }

  // 4b) Error al cargar el customer
  if (!customer) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <p className="body-02-regular text-text-primary-default">
          {customerError || "No se pudo cargar la información del cliente."}
        </p>
        <Button onClick={() => router.refresh()} variant="outline" size="md">
          Reintentar
        </Button>
      </div>
    );
  }

  if (isSigningOut) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <LoadingSpinner />
        <p className="body-02-regular text-text-primary-default">Saliendo...</p>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <LoadingSpinner />
        <p className="body-02-regular text-text-primary-default">
          Cargando perfil...
        </p>
      </div>
    );
  }

  // 5) Render final
  return (
    <div className="container mx-auto px-6 pt-[55px]  justify-between min-h-screen flex flex-col">
      <div className="space-y-3">
        <div className="flex flex-row justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium text-text-primary-default uppercase">
            Mi Cuenta
          </h1>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <Avatar className="mr-4 bg-background-fill-neutral-tertiary body-01-medium text-text-primary-default">
              <AvatarImage
                src={session?.user?.image || undefined}
                alt="Avatar"
              />
              <AvatarFallback>{customer.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="body-01-semibold">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="body-02-regular"> {customer.email}</div>
            </div>
          </div>
          <Link href="/account/edit" onClick={handleEditClick}>
            {" "}
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </Link>
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
                asChild
                variant="outline"
                size="lg"
                className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
              >
                <Link href="/account/orders">
                  <ShoppingBagIcon className="h-6 w-6" />
                  Compras
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
              >
                <Link href="/favorites">
                  <HeartIcon className="h-6 w-6" />
                  Favoritos
                </Link>
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
                asChild
                variant="outline"
                size="lg"
                className="flex flex-col items-start body-01-regular gap-2 px-2 py-2"
              >
                <Link href="/account/addresses">
                  <HomeIcon className="h-6 w-6" />
                  Direcciones
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Link
            href="/account/settings"
            className="flex items-center justify-between px-1 py-2"
          >
            <span className="body-02-medium">Ajustes</span>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between px-1 py-2"
          >
            <span className="body-02-medium">Locales</span>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between px-1 py-2"
          >
            <span className="body-02-medium">Contacto</span>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <div className="">
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row gap-1">
            <div className="body-02-medium"> {customer.email}</div>
            <div className="body-02-regular">no sos vos?</div>
          </div>
          <Button
            onClick={openLogoutConfirm}
            className="body-01-semibold"
            variant="link"
            size="text"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Saliendo..." : "Salir"}
          </Button>
        </div>
        <Footer />
        <ConfirmModal
          open={showLogoutConfirm}
          onCancel={closeLogoutConfirm}
          onConfirm={handleSignOut}
          message="¿Estas seguro que quiere salir de tu sesión?"
        />
      </div>
    </div>
  );
}
