// src/components/collections/ProductGrid.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/common/product-card";
import { extractColorVariants } from "@/lib/product-helpers";

type ProductGridProps = {
  title: string;
  products: ShopifyProduct[];
};

export function ProductGrid({ title, products }: ProductGridProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState("default");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (isFilterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFilterModalOpen]);

  // Lógica corregida para procesar tags y metacampos
  const { primaryFilterGroup, modalFilterGroups } = useMemo(() => {
    const primary: Record<string, Set<string>> = {};
    const modal: Record<string, Set<string>> = {};

    products.forEach((product) => {
      // 1. Procesa las etiquetas (tags) para los filtros principales
      product.tags?.forEach((tag) => {
        const parts = tag.split(":");
        if (
          parts.length === 2 &&
          (parts[0].trim().toLowerCase() === "subcategoría" ||
            parts[0].trim().toLowerCase() === "subcategoria")
        ) {
          const groupName = parts[0].trim();
          if (!primary[groupName]) {
            primary[groupName] = new Set();
          }
          primary[groupName].add(tag);
        }
      });

      // 2. Procesa el metacampo estándar de Color
      if (product.color?.reference?.fields) {
        const colorField = product.color.reference.fields.find(
          (f) => f.key === "name"
        );
        if (colorField?.value) {
          const groupName = "Color";
          if (!modal[groupName]) {
            modal[groupName] = new Set();
          }
          modal[groupName].add(`${groupName}:${colorField.value}`);
        }
      }

      // 3. Procesa metacampos personalizados
      const customMetafields = [product.talle, product.estacion];
      customMetafields.forEach((metafield) => {
        if (metafield?.key && metafield?.value) {
          const groupName =
            metafield.key.charAt(0).toUpperCase() + metafield.key.slice(1);
          if (!modal[groupName]) {
            modal[groupName] = new Set();
          }
          modal[groupName].add(`${groupName}:${metafield.value}`);
        }
      });
    });

    const primaryResult: Record<string, string[]> = {};
    for (const groupName in primary) {
      primaryResult[groupName] = Array.from(primary[groupName]).sort();
    }
    const modalResult: Record<string, string[]> = {};
    for (const groupName in modal) {
      modalResult[groupName] = Array.from(modal[groupName]).sort();
    }

    return {
      primaryFilterGroup: primaryResult,
      modalFilterGroups: modalResult,
    };
  }, [products]);

  const handleFilterToggle = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    if (activeFilters.length > 0) {
      const activeGroups: Record<string, string[]> = {};
      activeFilters.forEach((filter) => {
        const key = filter.split(":")[0].trim();
        if (!activeGroups[key]) {
          activeGroups[key] = [];
        }
        activeGroups[key].push(filter);
      });

      filtered = filtered.filter((product) => {
        return Object.entries(activeGroups).every(
          ([groupKey, groupFilters]) => {
            return groupFilters.some((filterValue) => {
              const value = filterValue.split(":")[1].trim();
              // Filtra por tag (Subcategoría)
              if (product.tags?.includes(filterValue)) return true;

              // Filtra por metacampos
              const key = groupKey.toLowerCase();
              if (
                key === "color" &&
                product.color?.reference?.fields.some(
                  (f) => f.key === "name" && f.value === value
                )
              )
                return true;
              // @ts-ignore
              if (product[key] && product[key].value === value) {
                return true;
              }

              return false;
            });
          }
        );
      });
    }

    switch (sortMethod) {
      case "price-asc":
        filtered.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-desc":
        filtered.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
        );
        break;
      default:
        break;
    }
    return filtered;
  }, [products, activeFilters, sortMethod]);

  const activeFilterCount = activeFilters.length;

  return (
    <div>
      {/* Título renderizado aquí */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <ChevronLeftIcon className="h-6 w-6 text-icon-primary-default" />
          <h1 className="body-01-medium uppercase tracking-tight text-text-primary-default">
            {title}
          </h1>
        </div>
        <div className="items-center flex ">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1 body-02-regular uppercase text-text-primary-default hover:bg-gray-50"
          >
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-background-fill-neutral-default body-03-semibold text-text-primary-invert rounded-full h-4 w-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <span>Filtrar</span>
          </button>
        </div>
      </div>
      <div
        className={`fixed inset-0 z-50 flex justify-center items-end ${
          isFilterModalOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setIsFilterModalOpen(false)}
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isFilterModalOpen ? "opacity-50" : "opacity-0"
          }`}
        />
        <div
          className={`relative bg-white w-full max-w-lg rounded-t-2xl shadow-xl transition-transform duration-300 transform ${
            isFilterModalOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold">Filtrar por</h2>
            <button onClick={() => setIsFilterModalOpen(false)}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {Object.keys(modalFilterGroups).length > 0 ? (
              Object.entries(modalFilterGroups).map(([groupName, values]) => (
                <div key={groupName}>
                  <h3 className="body-02-medium text-text-seconday-default mb-3">
                    {groupName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((filterString) => (
                      <button
                        key={filterString}
                        onClick={() => handleFilterToggle(filterString)}
                        className={`px-3 py-1.5 border rounded-full body-02-medium transition-colors ${
                          activeFilters.includes(filterString)
                            ? "text-text-primary-default border-gray-900"
                            : "text-text-secondary-default border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {filterString.split(":")[1].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay filtros disponibles.</p>
            )}
          </div>
          <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => setActiveFilters([])}
              className="text-sm font-medium text-gray-700 hover:underline"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
            >
              Ver {filteredAndSortedProducts.length} productos
            </button>
          </div>
        </div>
      </div>

      {/* --- Barra de Filtros y Ordenamiento --- */}
      <div className="mb-8 space-y-4">
        {Object.entries(primaryFilterGroup).map(([groupName, tags]) => (
          <div key={groupName}>
            <div className="flex flex-wrap gap-2 mt-5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterToggle(tag)}
                  className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors ${
                    activeFilters.includes(tag)
                      ? "text-text-primary-default border-border-primary-default"
                      : "text-text-secondary-default border-border-secondary-default hover:bg-gray-100"
                  }`}
                >
                  {tag.split(":")[1].trim()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Grilla de Productos --- */}
      <div className="-mx-6 h-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-5 [&>a>div]:px-4">
        {filteredAndSortedProducts.map((product) => (
          <div key={product.handle} className="h-full">
            <ProductCard
              key={product.handle}
              id={product.id}
              title={product.title}
              handle={product.handle}
              imageSrc={product.images.edges[0]?.node.url || "/placeholder.png"}
              altText={product.images.edges[0]?.node.altText || product.title}
              price={parseFloat(
                product.priceRange.minVariantPrice.amount
              ).toLocaleString("es-AR", {
                useGrouping: true,
              })}
              compareAtPrice={(() => {
                const cmp =
                  product.variants?.edges[0]?.node.compareAtPrice?.amount ??
                  null;
                if (!cmp) return undefined;
                return parseFloat(cmp).toLocaleString("es-AR", {
                  useGrouping: true,
                });
              })()}
              colorVariants={extractColorVariants(product)}
              isNew={(() => {
                const thirtyDays = 1000 * 60 * 60 * 24 * 30;
                const byDate = product.createdAt
                  ? Date.now() - Date.parse(product.createdAt) < thirtyDays
                  : false;
                const byTag = product.tags?.includes("new");
                return Boolean(byDate || byTag);
              })()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
