// app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { ExploreSection } from "@/components/home/explore-section";
import { ProductCarousel } from "@/components/home/product-carousel";
import { NoClipSection } from "@/components/home/noclip-section";
import { Footer } from "@/components/common/footer";
import {
  getSaleProducts,
  getNewProducts,
  FeaturedProduct,
} from "@/lib/shopify";

export default async function HomePage() {
  // 1) Traemos los productos en oferta y los más nuevos en paralelo
  const [newest, sale]: [FeaturedProduct[], FeaturedProduct[]] =
    await Promise.all([getNewProducts(12), getSaleProducts(12, 50)]);

  // 2) Combinamos los productos en oferta con los más nuevos, evitando duplicados
  const saleIds = new Set(sale.map((p) => p.id));
  const combined: FeaturedProduct[] = [
    ...newest.filter((p) => !saleIds.has(p.id)),
    ...sale,
  ];

  return (
    <section>
      {/* Hero carousel */}
      <HeroSection />

      {/* Carrusel de Ofertas + Nuevos */}
      <ProductCarousel title="Destacados" data={combined} />

      {/* Sección “Sin clip” */}
      <NoClipSection
        images={[
          "/images/noclip/noclip-1.webp",
          "/images/noclip/noclip-2.webp",
          "/images/noclip/noclip-3.webp",
        ]}
        href="/collections/season/invierno"
      />

      <ExploreSection
        title="Animate a explorar lo desconocido"
        product={{
          id: "1",
          title: "Producto Destacado",
          handle: "producto-destacado",
          imageSrc: "/images/products/product-1.png",
          altText: "Producto Destacado",
          price: "49.99",
        }}
      />
      <footer className="px-4">
        <Footer />
      </footer>
    </section>
  );
}
