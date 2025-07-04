"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export default function AccountEditPage() {
  const router = useRouter();
  const { data: rawSession } = useSession();
  const session = rawSession as any;

  const displayName = session?.user
    ? session.user.firstName || session.user.lastName
      ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim()
      : session.user.name
    : "";
  const displayEmail = session?.user?.email || "";
  const maskedPassword = displayEmail ? "********" : "";
  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex flex-row items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium uppercase justify-between">
          Editar Perfil
        </h1>
      </div>
      <div className="flex flex-col">
        <Link
          href="/account/edit/name"
          className="flex items-center justify-between px-1 py-2"
        >
          <div className="flex flex-col">
            <span className="body-02-regular">Nombre</span>
            {displayName && (
              <span className="body-03-regular text-text-secondary-default">
                {displayName}
              </span>
            )}
          </div>
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
        <Link
          href="/account/edit/email"
          className="flex items-center justify-between px-1 py-2"
        >
          <div className="flex flex-col">
            <span className="body-02-regular">Email</span>
            {displayEmail && (
              <span className="body-03-regular text-text-secondary-default">
                {displayEmail}
              </span>
            )}
          </div>
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
        <Link
          href="/account/edit/password"
          className="flex items-center justify-between px-1 py-2"
        >
          <div className="flex flex-col">
            <span className="body-02-regular">Contraseña</span>
            {maskedPassword && (
              <span className="body-03-regular text-text-secondary-default">
                {maskedPassword}
              </span>
            )}
          </div>
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      </div>
      <p className="body-03-regular text-text-secondary-default">
        En MUNAY nos tomamos muy serio tu privacidad y estamos comprometidos con
        la protección de tu información personal. Saber mas sobre cuánto nos
        interesa y cómo usamos tu información en Política & Privacidad.
      </p>
    </div>
  );
}
