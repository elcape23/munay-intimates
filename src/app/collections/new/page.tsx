import { getNewestProductsFull, getCollections } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
export default async function NewProductsPage() {
  const products = await getNewestProductsFull(60);
  const collections = await getCollections();
  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid
        title="Nuevos lanzamientos"
        products={products}
        collections={collections}
      />
      <Footer />
    </section>
  );
}
