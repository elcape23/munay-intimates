import { getProductsBySeason } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import { EmptyCollection } from "@/components/collections/empty-collection";

export default async function SeasonProductsPage({
  params,
}: {
  params: { season: string };
}) {
  const { season } = params;
  const products = await getProductsBySeason(season);
  if (!products.length) {
    return (
      <section className="container pt-[60px] mx-auto px-6 min-h-screen flex flex-col justify-between">
        <EmptyCollection />
        <Footer />
      </section>
    );
  }

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid title={season} products={products} />
      <Footer />
    </section>
  );
}
