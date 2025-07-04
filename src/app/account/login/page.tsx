// src/app/(pages)/account/login/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/account/login-form";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

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
          <LoginForm />
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
