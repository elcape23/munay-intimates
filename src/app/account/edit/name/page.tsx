"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { customerUpdate } from "@/lib/shopify";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/hooks/use-toast";

export default function EditNamePage() {
  const router = useRouter();
  const { data: rawSession, update } = useSession();
  const session = rawSession as any;
  const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setFirstName(session.user?.firstName || "");
      setLastName(session.user?.lastName || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.shopifyToken) return;

    setIsSaving(true);
    try {
      const result = await customerUpdate(session.user.shopifyToken, {
        firstName,
        lastName,
      });

      if (result.customer) {
        update?.({
          ...session,
          user: {
            ...session.user,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
          },
        });
        await checkAuthStatus();
        toast({ title: "Nombre actualizado" });
        router.back();
      } else if (result.customerUserErrors?.length) {
        toast({ title: result.customerUserErrors[0].message });
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast({ title: "No se pudo actualizar el nombre" });
    } finally {
      setIsSaving(false);
    }
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
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}
