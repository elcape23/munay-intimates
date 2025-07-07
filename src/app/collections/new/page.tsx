import { getNewestProductsFull } from "@/lib/shopify";
import { slugify } from "@/lib/utils";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";

export default async function NewProductsPage({
  searchParams,
}: {
  searchParams: { subcategory?: string };
}) {
  const products = await getNewestProductsFull(250);
  const subcat = searchParams.subcategory;
  const filtered = subcat
    ? products.filter((p) =>
        p.tags?.some((tag) => {
          const parts = tag.split(":");
          return (
            parts.length === 2 &&
            ["subcategoría", "subcategoria"].includes(
              parts[0].trim().toLowerCase()
            ) &&
            slugify(parts[1].trim()) === slugify(subcat)
          );
        })
      )
    : products;

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid title="Nuevos lanzamientos" products={filtered} />
      <Footer />
    </section>
  );
}
