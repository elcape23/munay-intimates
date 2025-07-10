"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { customerAccessTokenCreate } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
export default function EditPasswordPage() {
  const router = useRouter();
  const { data: rawSession } = useSession();
  const session = rawSession as any;
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currentPasswordMatch, setCurrentPasswordMatch] = useState<
    boolean | null
  >(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const verifyCurrentPassword = async () => {
    if (!session?.user?.email || currentPassword.length < 8) {
      return;
    }
    try {
      const result = await customerAccessTokenCreate({
        email: session.user.email,
        password: currentPassword,
      });
      setCurrentPasswordMatch(!!result.customerAccessToken);
    } catch (e) {
      setCurrentPasswordMatch(false);
    }
  };

  useEffect(() => {
    if (!currentPasswordTouched) {
      setCurrentPasswordMatch(null);
      return;
    }
    if (currentPassword.length < 8) {
      setCurrentPasswordMatch(null);
      return;
    }
    const timer = setTimeout(() => {
      verifyCurrentPassword();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPassword, currentPasswordTouched]);

  const isCurrentPasswordLengthValid = currentPassword.length >= 8;
  const isCurrentPasswordValid =
    isCurrentPasswordLengthValid && currentPasswordMatch === true;
  const currentPasswordStatus = !currentPasswordTouched
    ? null
    : currentPassword.length === 0
    ? "empty"
    : !isCurrentPasswordLengthValid
    ? "invalid"
    : currentPasswordMatch === null
    ? null
    : currentPasswordMatch
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

  const isConfirmValid = confirm === password && confirm.length >= 8;
  const confirmStatus = !confirmTouched
    ? null
    : confirm.length === 0
    ? "empty"
    : isConfirmValid
    ? "valid"
    : "invalid";

  const isFormValid =
    isCurrentPasswordValid && isPasswordValid && isConfirmValid;

  // legacy handler kept for compatibility with form submission
  // delegates to verifyCurrentPassword
  const handleCurrentPasswordBlur = () => {
    verifyCurrentPassword();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasswordMatch === null) {
      handleCurrentPasswordBlur();
    }
    if (!currentPassword || !password || !confirm) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirm) {
      setError("Las contrase\u00f1as no coinciden");
      return;
    }
    setError(null);
  };

  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex flex-row items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium ml-2 uppercase">Contraseña</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setCurrentPasswordTouched(true)}
            className={cn(
              "pr-10",
              currentPasswordStatus === "valid"
                ? "text-text-success-default"
                : currentPasswordStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              currentPasswordStatus === "valid"
                ? "text-icon-success-default"
                : currentPasswordStatus === "invalid"
                ? "text-icon-danger-default"
                : "text-icon-primary-default"
            )}
          >
            {showCurrentPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !currentPasswordTouched && "invisible",
              currentPasswordTouched &&
                (currentPasswordStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {currentPasswordTouched &&
              (currentPasswordStatus === "valid"
                ? "Coincide"
                : currentPasswordStatus === "empty"
                ? "Requerido"
                : currentPassword.length < 8
                ? "M\u00ednimo 8 caracteres"
                : "No coincide")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setPasswordTouched(true)}
            className={cn(
              "pr-10",
              passwordStatus === "valid"
                ? "text-text-success-default"
                : passwordStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              passwordStatus === "valid"
                ? "text-icon-success-default"
                : passwordStatus === "invalid"
                ? "text-icon-danger-default"
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
              (passwordStatus === "valid"
                ? "Bien hecho!"
                : "M\u00ednimo 8 caracteres")}
          </p>
        </div>
        <div className="space-y-2 relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setConfirmTouched(true)}
            className={cn(
              "pr-10",
              confirmStatus === "valid"
                ? "text-text-success-default"
                : confirmStatus === "invalid"
                ? "text-text-danger-default"
                : ""
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className={cn(
              "absolute inset-y-0 right-0 -top-9 flex items-center px-3",
              confirmStatus === "valid"
                ? "text-icon-success-default"
                : confirmStatus === "invalid"
                ? "text-icon-danger-default"
                : "text-icon-primary-default"
            )}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          <p
            className={cn(
              "px-3 body-03-regular min-h-5",
              !confirmTouched && "invisible",
              confirmTouched &&
                (confirmStatus === "valid"
                  ? "text-text-success-default"
                  : "text-text-danger-default")
            )}
          >
            {confirmTouched &&
              (confirmStatus === "valid"
                ? "Bien hecho!"
                : confirmStatus === "empty"
                ? "Requerido"
                : "No coincide")}
          </p>
        </div>
        {error && (
          <p className="body-03-regular text-text-danger-default">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={!isFormValid}>
          {" "}
          Guardar
        </Button>
      </form>
    </div>
  );
}
