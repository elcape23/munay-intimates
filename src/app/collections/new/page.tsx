import { getNewProducts } from "@/lib/shopify";
import { Footer } from "@/components/common/footer";
import { ProductCard } from "@/components/common/product-card";

export default async function NewProductsPage() {
  const products = await getNewProducts(60);
  return (
    <main className="container pt-[60px] mx-auto px-6 min-h-screen">
      <h1 className="heading-06-medium mb-4">Nuevos lanzamientos</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
      <Footer />
    </main>
  );
}
