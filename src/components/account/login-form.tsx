"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export default function LoginForm() {
  const { login, isLoggedIn, error: authError, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleInputChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    if (error) setError(null);
  };

  useEffect(() => {
    if (isLoggedIn) {
      setEmail("");
      setPassword("");
    }
  }, [isLoggedIn]);

  return (
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
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
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
  );
}
