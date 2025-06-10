// src/app/(pages)/collections/[handle]/page.tsx

import { getCollectionByHandle, ShopifyCollection } from "@/lib/shopify";
import { notFound } from "next/navigation";
// ¡NUEVO! Importamos nuestro nuevo componente.
import { ProductGrid } from "@/components/collections/product-grid";

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;

  const collection: ShopifyCollection | null = await getCollectionByHandle(
    handle
  );

  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          {collection.title}
        </h1>
      </div>

      {/* Usamos el nuevo componente y le pasamos los productos. */}
      <ProductGrid products={products} />
    </main>
  );
}
