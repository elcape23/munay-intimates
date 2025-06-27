// src/app/(pages)/account/login/page.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const { login, isLoggedIn, error: authError, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handleCredsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/account",
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/account");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const loginSuccess = await login({ email, password });

      if (!loginSuccess) {
        setError(authError || "El email o la contraseña son incorrectos.");
      }
    } catch (e) {
      console.error("Error atrapado en el componente de Login:", e);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    }
  };

  const handleInputChange = (setter: Function, value: string) => {
    setter(value);
    if (error) setError(null);
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">
            Iniciar Sesión
          </h1>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
          <form onSubmit={handleCredsLogin}>
            {/* Campos email/password */}
            <button type="submit">Ingresar</button>
            <a
              href="/api/auth/signin/google?callbackUrl=/account"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-center text-blue-600 hover:underline"
            >
              Iniciar sesión con Google
            </a>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ¿Eres un cliente nuevo? Puedes crear una cuenta durante el proceso
              de compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
