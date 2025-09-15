"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function LegalPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(false);
  const [ads, setAds] = useState(false);

  return (
    <div className="container mx-auto px-6 pt-[55px] pb-10 space-y-8">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium flex-1 text-right uppercase">
          Configuración de Cookies
        </h1>
      </div>

      <div className="space-y-4 body-02-regular text-text-primary-default">
        <p>
          Las cookies y otras tecnologías similares se utilizan con un
          determinado propósito. No te preocupes, no te vamos a espiar, las que
          ponemos son para mejorar tu experiencia y para que pueda funcionar
          nuestra plataforma. <br /> Las cookies que utilizamos pueden cambiar
          cada cierto tiempo, pero siempre puedes cambiar tu configuración en el
          botón gestionar cookies, siempre que quieras. <br />
          Si la configuración de cookies no se ajusta a ello, utilizaremos las
          cookies estrictamente necesarias y las cookies de preferencia para
          mejorar el acceso a la página.
        </p>
        <p>Para más información puede revisar nuestra Política de cookies.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="body-02-regular">GESTIÓN DE COOKIES</h2>
          <div className="flex flex-col items-start justify-start space-y-1">
            <span className="body-02-medium">
              COOKIES ESTRICTAMENTE NECESARIAS
            </span>
            <span className="body-02-regular">Activas siempre</span>
          </div>
          <p className="body-02-regular text-text-secondary-default">
            Estas cookies son necesarias para que la Plataforma funcione y no se
            pueden desactivar. Tenga en cuenta que, si las bloquea, no podremos
            proporcionar la funcionalidad y características básicas de la
            Plataforma y puede que algunos servicios no funcionen como deberían.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="body-02-medium">COOKIES DE ANÁLISIS</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={analysis}
                onChange={setAnalysis}
                className={`${
                  analysis
                    ? "bg-background-fill-neutral-default"
                    : "bg-background-fill-neutral-tertiary"
                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              >
                <span
                  className={`${
                    analysis ? "translate-x-4" : "translate-x-1"
                  } inline-block h-3 w-3 transform rounded-full bg-background-primary-default transition-transform`}
                />
              </Switch>
            </div>
          </div>
          <p className="body-02-regular text-text-secondary-default">
            Estas cookies nos permiten contar las visitas y fuentes de tráfico
            para que podamos medir y mejorar el rendimiento de nuestra
            Plataforma. Nos ayudan a saber qué páginas son las más y las menos
            populares, y ver cómo los visitantes se mueven por la Plataforma.
            Toda la información que recogen estas cookies es agregada y, por
            tanto, anónima. Si no permite estas cookies no sabremos cuándo ha
            visitado nuestra Plataforma.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="body-02-medium">COOKIES DE PERSONALIZACIÓN</span>
            <div className="flex items-center gap-2">
              <Switch
                checked
                disabled
                className="relative inline-flex h-5 w-9 items-center rounded-full bg-background-fill-neutral-tertiary"
              >
                <span className="inline-block h-3 w-3 translate-x-1 rounded-full bg-background-primary-default transition" />
              </Switch>
            </div>
          </div>
          <p className="body-02-regular text-text-secondary-default">
            Estas cookies están relacionadas con la personalización del
            contenido de nuestra Plataforma, como el idioma o la región en la
            que se encuentra, así como los artículos que ha visto o ha añadido a
            su carrito. Si no permite estas cookies, es posible que la
            Plataforma no recuerde su configuración y que usted vea contenido en
            un idioma diferente al seleccionado o que se le muestren artículos
            que no son relevantes para usted. Estas cookies no se pueden
            desactivar.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="body-02-medium">
              COOKIES DE PUBLICIDAD COMPORTAMENTAL
            </span>
            <div className="flex items-center gap-2">
              <Switch
                checked={ads}
                onChange={setAds}
                className={`${
                  ads
                    ? "bg-background-fill-neutral-default"
                    : "bg-background-fill-neutral-tertiary"
                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              >
                <span
                  className={`${
                    ads ? "translate-x-4" : "translate-x-1"
                  } inline-block h-3 w-3 transform rounded-full bg-background-primary-default transition-transform`}
                />
              </Switch>
            </div>
          </div>
          <p className="body-02-regular text-text-secondary-default">
            Estas cookies se utilizan para seguir a los visitantes en las
            distintas Plataformas. La intención es mostrar anuncios relevantes y
            atractivos para el usuario individual, y por lo tanto, más valiosos
            para los editores y terceros anunciantes. Estas cookies no se pueden
            utilizar.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" className="w-full">
          Confirmar Preferencias
        </Button>
      </div>
    </div>
  );
}
