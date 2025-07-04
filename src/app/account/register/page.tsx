"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/account/register-form";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/account");
    }
  }, [session, router]);

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
