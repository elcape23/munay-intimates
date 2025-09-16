"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function NewsletterPage() {
  const router = useRouter();
  const categories = [
    { id: "ropa-interior", label: "Ropa Interior" },
    { id: "fitness", label: "Fitness" },
    { id: "maternity", label: "Maternity" },
    { id: "carteras", label: "Carteras" },
  ];

  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          data-clarity-label="Volver desde newsletter"
        >
          {" "}
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium uppercase">Newsletter</h1>
      </div>
      <p className="body-02-regular">
        Personaliza las preferencias de tu newsletter y te enviaremos
        semanalmente actualizaciones con novedades y tendencias de tus
        categorías favoritas.
      </p>
      <p className="body-02-regular">
        Seleccionar Guardar para confirmar tus preferencias o Desuscribirte para
        removerlas.
      </p>
      <div className="space-y-4">
        <h2 className="body-02-regular">
          Elegir tus categoría(s) favorita(s):
        </h2>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <Checkbox id={cat.id} />
            <label htmlFor={cat.id} className="body-02-regular">
              {cat.label}
            </label>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2">
        <label htmlFor="privacy" className="body-03-regular">
          * He podido leer y entiendo las{" "}
          <Link href="#" className="underline">
            Política de Privacidad y Cookies
          </Link>{" "}
          y acepto recibir comunicaciones comerciales personalizadas de Munay a
          través de email.
        </label>
      </div>
      <Button
        className="w-full py-3"
        variant="outline"
        size="md"
        data-clarity-label="Guardar preferencias de newsletter"
      >
        {" "}
        Guardar
      </Button>
    </div>
  );
}
