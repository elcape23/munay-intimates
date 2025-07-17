"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegisterForm from "@/components/account/register-form";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { data: session } = useSession();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (session || isLoggedIn) {
      router.push(returnTo || "/account");
    }
  }, [session, isLoggedIn, router, returnTo]);
  return (
    <div className="flex justify-center items-center pt-[55px] px-6">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          <div className="flex flex-row justify-between">
            <Button onClick={() => router.back()} variant="ghost" size="icon">
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
            <h1 className="body-01-medium text-text-primary-default uppercase">
              Mi Cuenta
            </h1>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
