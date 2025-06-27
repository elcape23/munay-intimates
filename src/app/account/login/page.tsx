// src/app/(pages)/account/login/page.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import LoginForm from "@/components/account/login-form";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/account");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">
            Iniciar Sesión
          </h1>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="w-full mb-4 inline-block px-6 py-2 bg-white border rounded shadow-sm text-sm font-medium hover:bg-gray-50"
          >
            Iniciar sesión con Google
          </button>
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
