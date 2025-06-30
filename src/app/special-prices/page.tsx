import { getSaleProductsFull } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";

export default async function SpecialPricesPage() {
  const products = await getSaleProductsFull(250, 250);

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      {" "}
      <ProductGrid title="Special Prices" products={products} />
      <Footer />
    </section>
  );
}
