import { getNewestProducts } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";

export default async function NewProductsPage() {
  const products = await getNewestProducts(250);

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid title="Nuevos lanzamientos" products={products} />
      <Footer />
    </section>
  );
}
