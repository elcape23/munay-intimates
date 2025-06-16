// Ruta de ejemplo: src/app/page.tsx

import { Button } from "@/components/ui/button"; // Asumiendo que tu alias para componentes es @/
import { HeartIcon } from "@heroicons/react/24/outline"; // Icono de ejemplo, puedes usar cualquier otro

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold text-text-primary-default">
          Bienvenido a Munay
        </h1>
        <p className="text-text-secondary-default">
          Este es un ejemplo de cómo se ven los botones de tu Design System en
          acción.
        </p>

        {/* --- Galería de Botones --- */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Estos son los primary buttons.
            Aplicarán clases como:
          */}
          <Button variant="primary" size="lg">
            <HeartIcon className="w-6 h-6" />
            button text
            <HeartIcon className="w-6 h-6" />
          </Button>
          <Button variant="primary" size="md">
            <HeartIcon className="w-5 h-5" />
            button text
            <HeartIcon className="w-5 h-5" />
          </Button>
          <Button variant="primary" size="sm">
            <HeartIcon className="w-4 h-4" />
            button text
            <HeartIcon className="w-4 h-4" />
          </Button>

          {/* Estos son los secondary buttons.
            Aplicarán clases como:
          */}
          <Button variant="outline" size="lg">
            <HeartIcon className="w-6 h-6" />
            button text
            <HeartIcon className="w-6 h-6" />
          </Button>
          <Button variant="outline" size="md">
            <HeartIcon className="w-5 h-5" />
            button text
            <HeartIcon className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm">
            <HeartIcon className="w-4 h-4" />
            button text
            <HeartIcon className="w-4 h-4" />
          </Button>

          {/* Estos son los secondary buttons.
            Aplicarán clases como:
          */}
          <Button variant="link" size="lg">
            <HeartIcon className="w-6 h-6" />
            button text
          </Button>
          <Button variant="link" size="md">
            <HeartIcon className="w-5 h-5" />
            button text
          </Button>
          <Button variant="link" size="sm">
            <HeartIcon className="w-4 h-4" />
            button text
          </Button>

          {/* Este botón usará la variante 'destructive'.
            Aplicará clases como:
            - bg-background-surface-danger-default
          */}
          <Button variant="destructive">
            {" "}
            <HeartIcon className="w-6 h-6" />
            button text
            <HeartIcon className="w-6 h-6" />
          </Button>

          <Button variant="ghost">
            {" "}
            <HeartIcon className="w-6 h-6" />
            button text
            <HeartIcon className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </main>
  );
}
