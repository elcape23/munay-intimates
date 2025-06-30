"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <form className="space-y-10" onSubmit={handleLogin}>
      <div className="space-y-8">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => handleInputChange(setEmail, e.target.value)}
          className=""
          placeholder="Email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => handleInputChange(setPassword, e.target.value)}
          className=""
          placeholder="Contraseña"
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
      <div className="flex flex-row sm:flex-row gap-4">
        <Button asChild variant="outline" size="md" className="w-full py-3">
          <Link href="/account/register">Registrarse</Link>
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          variant="primary"
          size="md"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </div>
    </form>
  );
}
