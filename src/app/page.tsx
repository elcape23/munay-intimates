// app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { MainBanner } from "@/components/home/main-banner";
import { ProductCarousel } from "@/components/home/product-carousel";
import { NoClipSection } from "@/components/home/noclip-section";
import { Navbar } from "@/components/common/nav-bar";
import {
  getSaleProducts,
  getNewProducts,
  FeaturedProduct,
} from "@/lib/shopify";

export default async function HomePage() {
  // 1) Traemos primero los productos en oferta y los más nuevos
  const newestRaw: FeaturedProduct[] = await getNewProducts(12);
  const sale: FeaturedProduct[] = await getSaleProducts(12, 50);

  // 2) Marcamos los nuevos con isNew
  const newest: FeaturedProduct[] = newestRaw.map((product) => ({
    ...product,
    isNew: true,
  }));

  // 3) Unimos ambos arrays sin duplicar por ID
  const saleIds = new Set(sale.map((p) => p.id));
  const combined: FeaturedProduct[] = [
    ...newest.filter((p) => !saleIds.has(p.id)),
    ...sale,
  ];

  return (
    <>
      <Navbar />

      {/* Hero carousel */}
      <HeroSection />

      {/* Carrusel de Ofertas + Nuevos */}
      <ProductCarousel title="Destacados" data={combined} />

      {/* Sección “Sin clip” */}
      <NoClipSection />
    </>
  );
}
