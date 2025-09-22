// src/app/(pages)/collections/[handle]/page.tsx

import { getCollectionByHandle } from "@/lib/shopify";
import { notFound, redirect } from "next/navigation";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import { EmptyCollection } from "@/components/collections/empty-collection";
import { sortProductsByAvailability } from "@/lib/product-helpers";
import { slugify } from "@/lib/utils";

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle: rawHandle } = params;
  const normalizedHandle = slugify(rawHandle);

  if (!normalizedHandle) {
    notFound();
  }

  if (normalizedHandle !== rawHandle) {
    redirect(`/collections/${normalizedHandle}`);
  }

  const collection = await getCollectionByHandle(normalizedHandle, 16);
  if (!collection) {
    notFound();
  }

  const products = sortProductsByAvailability(
    collection.products.edges.map((edge) => edge.node)
  );
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
        handle={collection.handle}
      />{" "}
      <Footer />
    </section>
  );
}
