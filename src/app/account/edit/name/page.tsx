"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function EditNamePage() {
  const router = useRouter();
  const { data: rawSession } = useSession();
  const session = rawSession as any;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (session) {
      setFirstName(session.user?.firstName || "");
      setLastName(session.user?.lastName || "");
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardar nombre", firstName, lastName);
  };

  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex items-center">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium ml-2">Nombre</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
    </div>
  );
}
