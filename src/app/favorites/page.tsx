"use client";

// src/app/favorites/page.tsx

import { useFavoritesStore } from "@/store/favorites-store";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/common/favorite-button";

export default function FavoritesPage() {
  const { favoriteProducts, isLoading } = useFavoritesStore();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Mis Favoritos
      </h1>

      {isLoading ? (
        <p className="text-center text-gray-500">
          Cargando tus productos favoritos...
        </p>
      ) : (favoriteProducts ?? []).length === 0 ? (
        <div className="text-center text-gray-500">
          <p>Aún no has guardado ningún producto como favorito.</p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Explorar productos
          </Link>
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
