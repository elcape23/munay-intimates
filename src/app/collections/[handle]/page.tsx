// src/app/(pages)/collections/[handle]/page.tsx

import { getCollectionByHandle } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import { EmptyCollection } from "@/components/collections/empty-collection";

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;
  const collection = await getCollectionByHandle(handle, 16);
  if (!collection) {
    notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);
  const pageInfo = collection.products.pageInfo;

  if (products.length === 0) {
    return (
      <section className="container pt-[60px] mx-auto px-6 min-h-screen flex flex-col justify-between">
        <EmptyCollection />
        <Footer />
      </section>
    );
  }

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid
        title={collection.title}
        products={products}
        pageInfo={pageInfo}
        handle={handle}
      />{" "}
      <Footer />
    </section>
  );
}
