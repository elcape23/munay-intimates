import { getProductsBySeason, getCollectionsBySeason } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import { notFound } from "next/navigation";

export default async function SeasonProductsPage({
  params,
}: {
  params: { season: string };
}) {
  const { season } = params;
  const products = await getProductsBySeason(season);
  if (!products.length) notFound();
  const collections = await getCollectionsBySeason(season);

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid
        title={season}
        products={products}
        collections={collections}
      />
      <Footer />
    </section>
  );
}
