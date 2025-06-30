import { getSaleProductsFull, getCollections } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";

export default async function SpecialPricesPage() {
  const [products, collections] = await Promise.all([
    getSaleProductsFull(250, 250),
    getCollections(),
  ]);

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid
        title="Precios Especiales"
        products={products}
        collections={collections}
      />
      <Footer />
    </section>
  );
}
