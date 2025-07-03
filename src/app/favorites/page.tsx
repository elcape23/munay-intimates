"use client";

// src/app/favorites/page.tsx

import { useFavoritesStore } from "@/store/favorites-store";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/favorite-button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/common/footer";

export default function FavoritesPage() {
  const { favoriteProducts, isLoading } = useFavoritesStore();

  return (
    <main className="container mx-auto px-6 mt-[55px] min-h-screen flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="icon"
        >
          <ChevronLeftIcon className="w-6 h-6 text-black" />
        </Button>
        <h1 className="body-01-medium">FAVORITOS</h1>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">
          Cargando tus productos favoritos...
        </p>
      ) : (favoriteProducts ?? []).length === 0 ? (
        <div className="justify-between items-center text-gray-500">
          <div className="flex flex-col items-center">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <Link
              href={`/products/${product.handle}`}
              key={product.handle}
              className="group block"
            >
              <div className="border rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
                <div className="relative w-full h-64">
                  <Image
                    src={
                      product.images.edges[0]?.node.url || "/placeholder.png"
                    }
                    alt={product.images.edges[0]?.node.altText || product.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton productHandle={product.handle} />
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {product.title}
                  </h2>
                  <div className="flex-grow"></div>
                  <p className="text-gray-600 mt-2">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: product.priceRange.minVariantPrice.currencyCode,
                      maximumFractionDigits: 0,
                    }).format(
                      parseFloat(product.priceRange.minVariantPrice.amount)
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
