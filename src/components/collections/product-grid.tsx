// src/components/collections/ProductGrid.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ProductGridProps = {
  products: ShopifyProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
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
      {/* --- Modal de Filtros --- */}
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
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {groupName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((filterString) => (
                      <button
                        key={filterString}
                        onClick={() => handleFilterToggle(filterString)}
                        className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-colors ${
                          activeFilters.includes(filterString)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
            <h3 className="font-semibold text-gray-800 mb-2">{groupName}</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterToggle(tag)}
                  className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors ${
                    activeFilters.includes(tag)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {tag.split(":")[1].trim()}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filtrar</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-gray-800 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex-shrink-0">
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Orden por defecto</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Grilla de Productos --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <Link
            href={`/products/${product.handle}`}
            key={product.handle}
            className="group block"
          >
            <div className="border rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
              <div className="relative w-full h-64">
                <Image
                  src={product.images.edges[0]?.node.url || "/placeholder.png"}
                  alt={product.images.edges[0]?.node.altText || product.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
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
                  }).format(
                    parseFloat(product.priceRange.minVariantPrice.amount)
                  )}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
