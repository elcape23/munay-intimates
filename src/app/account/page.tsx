"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { getCustomer } from "@/lib/shopify";
import { OrderHistory } from "@/components/account/order-history";
import LoginForm from "@/components/account/login-form";

export default function AccountPage() {
  // rawSession lo casteamos a any para saltarnos el TS
  const { data: rawSession, status } = useSession();
  const session = rawSession as any;
  const [customer, setCustomer] = useState<any>(null);
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
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <p className="text-center text-lg">No estás logueado.</p>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full max-w-xs inline-block px-6 py-2 bg-white border rounded shadow-sm text-sm font-medium hover:bg-gray-50"
        >
          Iniciar sesión con Google
        </button>
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
    );
  }

  // 3) Con session garantizado, traemos el customer
  useEffect(() => {
    const token: string = session.user.shopifyToken;
    getCustomer(token).then((data) => setCustomer(data));
  }, [session.user.shopifyToken]);

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
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Cuenta</h1>
            <p className="text-lg text-gray-600 mt-1">
              ¡Hola, {session.user.name}! Bienvenido a tu panel.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm sticky top-28">
              <h2 className="text-xl font-semibold mb-4">
                Información del Perfil
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Nombre:</span>{" "}
                  {customer.firstName} {customer.lastName}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {customer.email}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">
                Historial de Pedidos
              </h2>
              <OrderHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
