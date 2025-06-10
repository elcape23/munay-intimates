// src/app/(pages)/account/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { OrderHistory } from "@/components/account/order-history";

export default function AccountPage() {
  const router = useRouter();

  const { customer, isLoggedIn, isLoading: isAuthLoading } = useAuthStore();

  // Este estado es la clave para evitar el error del servidor.
  const [hasMounted, setHasMounted] = useState(false);

  // Este useEffect se ejecuta solo una vez en el cliente, después del renderizado inicial.
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Este useEffect se encarga de la redirección, pero solo si el componente ya está en el cliente.
  useEffect(() => {
    if (hasMounted && !isAuthLoading && !isLoggedIn) {
      router.push("/account/login");
    }
  }, [hasMounted, isAuthLoading, isLoggedIn, router]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push("/");
  };

  // Condición de carga robusta: no renderizamos nada hasta estar en el cliente Y que la auth termine.
  if (!hasMounted || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-12">Cargando tu cuenta...</div>
      </div>
    );
  }

  // Si después de cargar, el usuario no está logueado, el useEffect de arriba ya lo está redirigiendo.
  // Mostramos un mensaje mientras tanto para evitar cualquier error.
  if (!isLoggedIn || !customer) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-12">Verificando sesión...</div>
      </div>
    );
  }

  // Si llegamos aquí, es 100% seguro que tenemos los datos del cliente.
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Cuenta</h1>
            <p className="text-lg text-gray-600 mt-1">
              ¡Hola, {customer.firstName}! Bienvenido a tu panel.
            </p>
          </div>
          <button
            onClick={handleLogout}
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
