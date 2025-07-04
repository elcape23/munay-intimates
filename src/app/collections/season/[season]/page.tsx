import { getProductsBySeason } from "@/lib/shopify";
import { ProductGrid } from "@/components/collections/product-grid";
import { Footer } from "@/components/common/footer";
import Link from "next/link";
import Image from "next/image";

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
        <div className="flex flex-col items-center justify-center flex-grow">
          <Image
            src="/illustrations/collections-empty.svg"
            alt="Colección vacía"
            width={240}
            height={240}
            className="mb-4"
          />
          <h1 className="heading-06-regular text-text-primary-default mb-6 text-center">
            Pronto habrá productos de esta categoría
          </h1>
          <Link
            href="/"
            className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
          >
            Seguir comprando
          </Link>
        </div>
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
