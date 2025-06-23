"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ProductCard, {
  ProductCardProps,
} from "@/components/common/product-card";
import { ShopifyProduct } from "@/lib/shopify";
import { FunnelIcon, XMarkIcon } from "lucide-react";

interface ProductGridProps {
  title: string;
  products: ShopifyProduct[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
}) => {
  const [mounted, setMounted] = useState(false);
  const [filterRoot, setFilterRoot] = useState<Element | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFilterCount = 0; // Ajusta según estado real

  useEffect(() => {
    setMounted(true);
    setFilterRoot(document.getElementById("filter-root"));
  }, []);

  // Botón de Filtrar (portal)
  const filterButton = (
    <button
      onClick={() => setIsFilterModalOpen(true)}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <FunnelIcon className="h-5 w-5" />
      <span>Filtrar</span>
      {activeFilterCount > 0 && (
        <span className="ml-1 bg-gray-800 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  // Función para mapear ShopifyProduct a ProductCardProps
  const toCardProps = (product: ShopifyProduct): ProductCardProps => {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    const compare = product.priceRange.maxVariantPrice.amount
      ? parseFloat(product.priceRange.maxVariantPrice.amount)
      : undefined;
    const isNew =
      new Date().getTime() - new Date(product.createdAt).getTime() <
      1000 * 3600 * 24 * 30;
    // Extrae variantes de color (fallback mínimo)
    const colorOption = product.options.find(
      (o) => o.name.toLowerCase() === "color"
    );
    const colorVariants =
      Array.isArray(colorOption?.values) && colorOption.values.length
        ? colorOption.values
        : ["#000000"];

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      imageSrc: product.images.edges[0]?.node.url || "/placeholder.png",
      altText: product.images.edges[0]?.node.altText || product.title,
      price: price.toFixed(0),
      compareAtPrice:
        compare && compare > price ? compare.toFixed(0) : undefined,
      colorVariants,
      isNew,
    };
  };

  return (
    <>
      {/* Portal de Filtrar */}
      {mounted && filterRoot && createPortal(filterButton, filterRoot)}

      {/* Título de la colección */}
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
        {title}
      </h1>

      {/* Modal de filtros */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtrar</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {/* Opciones de filtrado aquí */}
          </div>
        </div>
      )}

      {/* Grid de productos con ProductCard */}
      <div className="-mx-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
        {products.map((product) => (
          <div key={product.handle} className="h-full">
            <ProductCard
              id={product.id}
              title={product.title}
              handle={product.handle}
              imageSrc={product.images.edges[0]?.node.url || "/placeholder.png"}
              altText={product.images.edges[0]?.node.altText || product.title}
              price={parseFloat(
                product.priceRange.minVariantPrice.amount
              ).toFixed(0)}
              compareAtPrice={
                product.priceRange.maxVariantPrice.amount
                  ? parseFloat(
                      product.priceRange.maxVariantPrice.amount
                    ).toFixed(0)
                  : undefined
              }
              colorVariants={
                product.options.find((o) => o.name.toLowerCase() === "color")
                  ?.values || []
              }
              isNew={
                new Date().getTime() - new Date(product.createdAt).getTime() <
                1000 * 3600 * 24 * 30
              }
            />
          </div>
        ))}
      </div>
    </>
  );
};
