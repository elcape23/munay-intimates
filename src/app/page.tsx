// app/page.tsx
import { HeroSection } from "@/components/home/hero-section";
import { LoadingSkeleton } from "@/components/home/loading-skeleton";
import { MainBanner } from "@/components/home/main-banner";
import { ProductCarousel } from "@/components/home/product-carousel";
import { NoClipSection } from "@/components/home/noclip-section";

// app/page.tsx
export default function HomePage() {
  const isLoading = false;

  // 👉 Aquí le dices a TS “éste es un array de any”
  const featuredProducts: any[] = [];

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <HeroSection />
          <MainBanner />

          <ProductCarousel title="Destacados" data={featuredProducts} />

          <NoClipSection />

          <ProductCarousel title="Lo más nuevo" data={featuredProducts} />
        </>
      )}
    </>
  );
}
