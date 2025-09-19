import Link from "next/link";

import { Footer } from "@/components/common/footer";
import { getCollections } from "@/lib/shopify";

const FEATURED_LINKS = [
  {
    title: "Nuevos lanzamientos",
    description:
      "Descubrí los productos más recientes que acaban de llegar al catálogo.",
    href: "/collections/new",
  },
  {
    title: "Colecciones por temporada",
    description:
      "Explorá nuestras propuestas pensadas para cada estación del año.",
    href: "/collections/season",
  },
];

export default async function CollectionsLandingPage() {
  const collections = await getCollections();

  const visibleCollections = collections
    .filter((collection) => collection.handle && collection.title)
    .reduce<{ id: string; title: string; handle: string }[]>(
      (acc, collection) => {
        if (!acc.some((item) => item.handle === collection.handle)) {
          acc.push({
            id: collection.id,
            title: collection.title,
            handle: collection.handle,
          });
        }
        return acc;
      },
      []
    )
    .sort((a, b) =>
      a.title.localeCompare(b.title, "es", { sensitivity: "base" })
    );

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen flex flex-col">
      <header className="max-w-2xl">
        <h1 className="body-01-medium uppercase tracking-tight text-text-primary-default mb-4">
          Colecciones
        </h1>
        <p className="body-02-regular text-text-secondary-default">
          Elegí una colección para explorar nuestros productos. Podés comenzar
          por las recomendaciones destacadas o navegar por la lista completa.
        </p>
      </header>

      <div className="grid gap-6 mt-10 md:grid-cols-2">
        {FEATURED_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-border-secondary-default p-6 transition-colors hover:border-border-primary-default hover:bg-background-secondary-default"
          >
            <h2 className="body-01-medium text-text-primary-default mb-2">
              {link.title}
            </h2>
            <p className="body-02-regular text-text-secondary-default">
              {link.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="body-01-medium uppercase tracking-tight text-text-primary-default mb-4">
          Todas las colecciones
        </h2>
        {visibleCollections.length === 0 ? (
          <p className="body-02-regular text-text-secondary-default">
            No pudimos cargar las colecciones en este momento. Intentá
            nuevamente más tarde.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCollections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.handle}`}
                  className="block rounded-lg border border-border-secondary-default px-4 py-3 text-text-primary-default transition-colors hover:border-border-primary-default hover:text-brand-primary"
                >
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto pt-12">
        <Footer />
      </div>
    </section>
  );
}
