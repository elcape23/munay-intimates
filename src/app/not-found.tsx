import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/common/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background-primary-default px-6">
      <div className="flex flex-col items-center justify-center flex-grow space-y-4 text-center">
        <Image
          src="/illustrations/404-image.svg"
          alt="404"
          width={240}
          height={240}
          className="mb-4"
        />
        <h1 className="heading-06-medium text-text-primary-default">
          Página no encontrada
        </h1>
        <p className="body-02-regular text-text-secondary-default">
          Lo sentimos, no pudimos encontrar lo que buscas.
        </p>
        <Link
          href="/"
          className="body-02-semibold text-primary-default underline hover:no-underline"
        >
          Volver al inicio
        </Link>
      </div>
      <Footer />
    </div>
  );
}
