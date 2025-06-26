// src/app/(pages)/collections/[handle]/page.tsx

import {
  getCollectionByHandle,
  getCollections,
  ShopifyCollection,
} from "@/lib/shopify";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";

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
  const collections = await getCollections();

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid
        title={collection.title}
        products={products}
        collections={collections}
      />
      <Footer />
    </section>
  );
}
