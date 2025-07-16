"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Footer } from "@/components/common/footer";

export default function LocalesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-6 pt-[55px] min-h-screen flex flex-col justify-between space-y-4">
      <div className="flex justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium text-text-primary-default uppercase">
          Locales
        </h1>
      </div>
      <div className="flex-grow">
        <iframe
          title="Mapa de la tienda"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d287.1867729479461!2d-65.28202217908905!3d-26.808126508407526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225d2c77faaa2b%3A0x73361e509ba21c2e!2sGuyanas%20687%2C%20Yerba%20Buena%2C%20Tucum%C3%A1n!5e1!3m2!1ses-419!2sar!4v1752669811572!5m2!1ses-419!2sar"
          className="w-full h-96 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <Footer />
    </div>
  );
}
