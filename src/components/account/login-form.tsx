"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginForm() {
  const { login, isLoggedIn, error: authError, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const loginSuccess = await login({ email, password });

      if (loginSuccess) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (result?.error) {
          setError(result.error);
        }
      } else {
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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => handleInputChange(setPassword, e.target.value)}
            className="pr-10"
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-icon-primary-default"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p
          className={cn(
            "text-red-600 text-sm text-center min-h-5",
            !error && "invisible"
          )}
        >
          {error || ""}
        </p>{" "}
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
