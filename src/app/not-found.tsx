import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-background-primary-default px-6 text-center">
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
    </section>
  );
}
