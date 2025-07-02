"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function EditPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardar contraseña");
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
        <Input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
    </div>
  );
}
