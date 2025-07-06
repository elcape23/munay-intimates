"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const { signUp, error: authError, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeToEmails, setSubscribeToEmails] = useState(true);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const isFirstNameValid = firstName.trim().length >= 3;
  const firstNameStatus = !firstNameTouched
    ? null
    : firstName.length === 0
    ? "empty"
    : isFirstNameValid
    ? "valid"
    : "invalid";

  const isLastNameValid = lastName.trim().length >= 3;
  const lastNameStatus = !lastNameTouched
    ? null
    : lastName.length === 0
    ? "empty"
    : isLastNameValid
    ? "valid"
    : "invalid";

  const isEmailValid = /^[^\s@]+@[^\s@]+\.com$/.test(email);
  const emailStatus = !emailTouched
    ? null
    : email.length === 0
    ? "empty"
    : isEmailValid
    ? "valid"
    : "invalid";

  const isPasswordValid = password.length >= 8;
  const passwordStatus = !passwordTouched
    ? null
    : password.length === 0
    ? "empty"
    : isPasswordValid
    ? "valid"
    : "invalid";

  const isFormValid =
    isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const success = await signUp({
      firstName,
      lastName,
      email,
      password,
      subscribeToEmails,
    });
    if (!success) {
      setError(authError || "No se pudo crear la cuenta.");
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
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
      <div className="space-y-1">
        <div className="space-y-2 relative">
          <Input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => handleInputChange(setFirstName, e.target.value)}
            onBlur={() => setFirstNameTouched(true)}
            placeholder="Nombre"
            className={cn(
              "pr-10",
              firstNameStatus === "valid"
                ? "text-text-success-default"
                : firstNameStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {firstNameStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {firstNameStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !firstNameTouched && "invisible",
              firstNameTouched &&
                (firstNameStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {firstNameTouched &&
              (firstNameStatus === "empty"
                ? "Requerido"
                : firstNameStatus === "valid"
                ? "Correcto"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => handleInputChange(setLastName, e.target.value)}
            onBlur={() => setLastNameTouched(true)}
            placeholder="Apellido"
            className={cn(
              "pr-10",
              lastNameStatus === "valid"
                ? "text-text-success-default"
                : lastNameStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          {lastNameStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {lastNameStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !lastNameTouched && "invisible",
              lastNameTouched &&
                (lastNameStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {lastNameTouched &&
              (lastNameStatus === "empty"
                ? "Requerido"
                : lastNameStatus === "valid"
                ? "Correcto"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => handleInputChange(setEmail, e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="Email"
            className={cn(
              "pr-10",
              emailStatus === "valid"
                ? "text-text-success-default"
                : emailStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />{" "}
          {emailStatus === "valid" && (
            <CheckCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-success-default" />
          )}
          {emailStatus === "invalid" && (
            <XCircleIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 -translate-y-1/2 text-icon-danger-default" />
          )}
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !emailTouched && "invisible",
              emailTouched &&
                (emailStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {emailTouched &&
              (emailStatus === "empty"
                ? "Requerido"
                : emailStatus === "valid"
                ? "Correcto"
                : "Incorrecto")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => handleInputChange(setPassword, e.target.value)}
            onFocus={() => setPasswordTouched(true)}
            className={cn(
              "pr-10",
              passwordStatus === "valid"
                ? "text-text-success-default"
                : passwordStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              passwordStatus === "valid"
                ? "text-icon-success-default"
                : "text-icon-primary-default"
            )}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !passwordTouched && "invisible",
              passwordTouched &&
                (passwordStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {passwordTouched &&
              (passwordStatus === "valid" ? "Correcto" : "Mínimo 8 caracteres")}
          </p>
        </div>
        <div className="flex items-start gap-2 py-2">
          <input
            id="subscribeToEmails"
            name="subscribeToEmails"
            type="checkbox"
            checked={subscribeToEmails}
            onChange={(e) => setSubscribeToEmails(e.target.checked)}
            className="h-4 w-4 accent-background-fill-neutral-default"
          />
          <label htmlFor="subscribeToEmails" className="body-02-regular">
            Quiero recibir novedades e información de Munay vía email
          </label>
        </div>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </div>
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        variant="primary"
        size="lg"
      >
        {isLoading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
}
