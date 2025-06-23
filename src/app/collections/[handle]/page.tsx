// src/app/(pages)/collections/[handle]/page.tsx

import { getCollectionByHandle, ShopifyCollection } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/collections/product-grid";

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

  return (
    <main className="pt-[67px] bg-gray-50 min-h-screen">
      <section className="container bg-background-primary-default mx-auto px-6 pb-16">
        <ProductGrid title={collection.title} products={products} />
      </section>
    </main>
  );
}
