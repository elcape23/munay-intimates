"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadClarity } from "@/components/common/clarity";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === null) {
      setVisible(true);
    } else if (consent === "accepted") {
      loadClarity();
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
    loadClarity();
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background-primary-default p-4 pb-6">
      <div className="max-w-screen-md mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2>
          <span className="body-01-bold">Cookies</span>
        </h2>
        <div>
          <p className="body-02-regular">
            Utilizamos cookies propias y de terceros con fines analíticos y para
            mostrarte anuncios en relación con tus preferencias, según tus
            hábitos y tu perfil.
          </p>
          <Button
            asChild
            variant="link"
            size="sm"
            className="body-03-regular text-text-secondary-default px-0 mt-2"
          >
            <a href="/politica-de-cookies">Política de Cookies</a>
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="body-02-regular w-[100px]"
            onClick={reject}
          >
            Rechazar
          </Button>
          <Button onClick={accept} className="w-[100px]">
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
