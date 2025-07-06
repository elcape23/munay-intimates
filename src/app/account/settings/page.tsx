"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function AccountSettingsPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex flex-row items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium uppercase">Ajustes</h1>
      </div>
      <div className="flex flex-col">
        <span className="body-02-medium px-1 py-2">Newsletter</span>
        <span className="body-02-medium px-1 py-2">
          Configuración de Cookies
        </span>
      </div>
    </div>
  );
}
