"use client";

import { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const { signUp, error: authError, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const success = await signUp({ firstName, lastName, email, password });
    if (!success) {
      setError(authError || "No se pudo crear la cuenta.");
    }
  };

  const handleInputChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    if (error) setError(null);
  };

  return (
    <form className="space-y-10" onSubmit={handleRegister}>
      <div className="space-y-8">
        <Input
          id="firstName"
          name="firstName"
          type="text"
          required
          value={firstName}
          onChange={(e) => handleInputChange(setFirstName, e.target.value)}
          placeholder="Nombre"
        />
        <Input
          id="lastName"
          name="lastName"
          type="text"
          required
          value={lastName}
          onChange={(e) => handleInputChange(setLastName, e.target.value)}
          placeholder="Apellido"
        />
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => handleInputChange(setEmail, e.target.value)}
          placeholder="Email"
        />
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        variant="primary"
        size="md"
      >
        {isLoading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
}
