// src/app/(pages)/collections/[handle]/page.tsx

import { getCollectionByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import Link from "next/link";
import Image from "next/image";

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;

  console.log("⚙️ Collection handle recibido:", handle);
  const collection = await getCollectionByHandle(handle);
  console.log("⚙️ Resultado getCollectionByHandle:", collection);

  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  if (products.length === 0) {
    return (
      <section className="container pt-[60px] mx-auto px-6 min-h-screen flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-grow">
          <Image
            src="/illustrations/collections-empty.svg"
            alt="Colección vacía"
            width={240}
            height={240}
            className="mb-4"
          />
          <h1 className="heading-06-regular text-text-primary-default mb-6 text-center">
            Pronto habrá productos de esta categoría
          </h1>
          <Link
            href="/"
            className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
          >
            Seguir comprando
          </Link>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid title={collection.title} products={products} />
      <Footer />
    </section>
  );
}
