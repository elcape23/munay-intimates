"use client";

// src/app/favorites/page.tsx

import { useFavoritesStore } from "@/store/favorites-store";
import Link from "next/link";
import Image from "next/image";

import { Footer } from "@/components/common/footer";
import { ProductGrid } from "@/components/collections/product-grid";

export default function FavoritesPage() {
  const { favoriteProducts, isLoading } = useFavoritesStore();

  if (isLoading) {
    return (
      <main className="container pt-[60px] mx-auto px-6 min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">
          Cargando tus productos favoritos...
        </p>
      </main>
    );
  }

  if (!favoriteProducts || favoriteProducts.length === 0) {
    return (
      <main className="container mx-auto px-6 mt-[55px] min-h-screen flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
          <Image
            src="/illustrations/fav-empty.svg"
            alt="Favoritos vacío"
            width={240}
            height={240}
            className="mb-4"
          />
          <h1 className="heading-06-regular text-text-primary-default mb-6 text-center">
            Aún no has guardado ningún producto como favorito.
          </h1>
          <Link
            href="/"
            className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
          >
            Explorar productos
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <section className="container pt-[60px] mx-auto px-6 min-h-screen">
      <ProductGrid title="FAVORITOS" products={favoriteProducts} />
      <Footer />
    </section>
  );
}
