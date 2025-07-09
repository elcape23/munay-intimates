// src/app/(pages)/account/login/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/account/login-form";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingAccount, setLoadingAccount] = useState(false);

  const handleGoogle = (e: React.MouseEvent) => {
    e.preventDefault();

    // Abrimos la URL de login directamente en una nueva pestaña
    window.open(
      "/api/auth/signin/google?callbackUrl=/account",
      "_blank",
      "noopener"
    );
  };

  useEffect(() => {
    if (session) {
      router.push("/account");
    }
  }, [session, router]);

  if (loadingAccount && !session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <LoadingSpinner />
        <p className="body-02-regular text-text-primary-default">
          Cargando datos de la cuenta...
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">
            Iniciar Sesión
          </h1>
          <Button
            onClick={handleGoogle}
            className="w-full mb-4 inline-block px-6 py-3 hover:bg-gray-50"
            variant="secondary"
            size="lg"
          >
            {" "}
            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 mr-2" />
            Iniciar sesión con Google
          </Button>
          <LoginForm onLoginSuccess={() => setLoadingAccount(true)} />
          <div className="text-center mt-6">
            <p className="body-03-regular text-text-secondary-default">
              ¿Eres un cliente nuevo? Puedes crear una cuenta durante el proceso
              de compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
