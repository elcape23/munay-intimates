// src/components/collections/ProductGrid.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { ShopifyProduct, ShopifyCollection } from "@/lib/shopify";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/common/product-card";
import { extractColorVariants } from "@/lib/product-helpers";
import { COLOR_MAP } from "@/lib/color-map";

type ProductGridProps = {
  title: string;
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
};

export function ProductGrid({
  title,
  products,
  collections,
}: ProductGridProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState("default");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);

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
  const { primaryFilterGroup, modalFilterGroups, minPrice, maxPrice } =
    useMemo(() => {
      const primary: Record<string, Set<string>> = {};
      const modal: Record<string, Set<string>> = {};
      const prices: number[] = [];

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

        // 2. Procesa el metacampo o la opción de producto para Color
        const groupNameColor = "Color";
        if (!modal[groupNameColor]) modal[groupNameColor] = new Set();
        if (product.color?.reference?.fields) {
          const hexField = product.color.reference.fields.find(
            (f) => f.key === "hex"
          );
          const nameField = product.color.reference.fields.find(
            (f) => f.key === "name" || f.key === "value"
          );
          const colorValue = hexField?.value || nameField?.value;
          if (colorValue) {
            modal[groupNameColor].add(`${groupNameColor}:${colorValue}`);
          }
        }

        const colorOption = product.options?.find(
          (opt) => opt.name.toLowerCase() === "color"
        );
        if (colorOption) {
          colorOption.values.forEach((val) =>
            modal[groupNameColor].add(`${groupNameColor}:${val}`)
          );
        }

        prices.push(parseFloat(product.priceRange.minVariantPrice.amount));

        // 3. Procesa metacampos personalizados
        const customMetafields = [product.talle, product.estacion];
        customMetafields.forEach((metafield) => {
          if (metafield?.key && metafield?.value) {
            const key = metafield.key.toLowerCase();
            if (key === "talle" || key === "talla") {
              if (!modal["Talle"]) modal["Talle"] = new Set();
              metafield.value.split(",").forEach((val) => {
                const trimmed = val.trim();
                if (trimmed) {
                  modal["Talle"].add(`Talle:${trimmed}`);
                }
              });
            } else {
              const groupName =
                metafield.key.charAt(0).toUpperCase() + metafield.key.slice(1);
              if (!modal[groupName]) {
                modal[groupName] = new Set();
              }
              if (
                "talle" === metafield.key.toLowerCase() ||
                "talla" === metafield.key.toLowerCase()
              ) {
                metafield.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .forEach((val) => {
                    modal[groupName].add(`${groupName}:${val}`);
                  });
              } else {
                modal[groupName].add(`${groupName}:${metafield.value}`);
              }
            }
          }
        });
        const sizeOption = product.options?.find((opt) =>
          ["talle", "talla", "size"].includes(opt.name.toLowerCase())
        );
        if (sizeOption) {
          if (!modal["Talle"]) modal["Talle"] = new Set();
          sizeOption.values.forEach((val) =>
            modal["Talle"].add(`Talle:${val}`)
          );
        }
      });

      const collectionGroup = "Colección";
      collections.forEach((c) => {
        if (!modal[collectionGroup]) modal[collectionGroup] = new Set();
        modal[collectionGroup].add(`${collectionGroup}:${c.handle}`);
      });

      const primaryResult: Record<string, string[]> = {};
      for (const groupName in primary) {
        primaryResult[groupName] = Array.from(primary[groupName]).sort();
      }
      const modalResult: Record<string, string[]> = {};
      for (const groupName in modal) {
        modalResult[groupName] = Array.from(modal[groupName]).sort();
      }

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        primaryFilterGroup: primaryResult,
        modalFilterGroups: modalResult,
        minPrice,
        maxPrice,
      };
    }, [products, collections]);

  useEffect(() => {
    setMinPriceFilter(minPrice);
    setMaxPriceFilter(maxPrice);
  }, [minPrice, maxPrice]);

  const handleFilterToggle = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const activeCollection = useMemo(() => {
    const col = activeFilters.find((f) => f.startsWith("Colección:"));
    return col ? col.split(":")[1].trim() : "";
  }, [activeFilters]);

  const handleCollectionChange = (value: string) => {
    const prefix = "Colección:";
    setActiveFilters((prev) => {
      const other = prev.filter((f) => !f.startsWith(prefix));
      return value ? [...other, `${prefix}${value}`] : other;
    });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    if (
      activeFilters.length > 0 ||
      minPriceFilter !== minPrice ||
      maxPriceFilter !== maxPrice
    ) {
      const activeGroups: Record<string, string[]> = {};
      activeFilters.forEach((filter) => {
        const key = filter.split(":")[0].trim();
        if (!activeGroups[key]) {
          activeGroups[key] = [];
        }
        activeGroups[key].push(filter);
      });

      filtered = filtered.filter((product) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        if (price < minPriceFilter || price > maxPriceFilter) return false;

        if (activeCollection) {
          const handles =
            product.collections?.edges.map((e) => e.node.handle) || [];
          if (!handles.includes(activeCollection)) return false;
        }

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
                  (f) =>
                    (f.key === "hex" && f.value === value) ||
                    (f.key === "name" && f.value === value) ||
                    (f.key === "value" && f.value === value)
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
  }, [
    products,
    activeFilters,
    sortMethod,
    minPriceFilter,
    maxPriceFilter,
    activeCollection,
    minPrice,
    maxPrice,
  ]);

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
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1 body-02-regular uppercase text-text-primary-default hover:bg-gray-50"
            variant="primary"
            size="lg"
          >
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-background-fill-neutral-default body-03-semibold text-text-primary-invert rounded-full h-4 w-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <span>Filtrar</span>
          </Button>
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
            <Button
              onClick={() => setIsFilterModalOpen(false)}
              variant="primary"
              size="lg"
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="body-02-medium text-text-seconday-default mb-3">
                Precio
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={minPriceFilter}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMinPriceFilter(val);
                      if (val > maxPriceFilter) setMaxPriceFilter(val);
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={maxPriceFilter}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxPriceFilter(val);
                      if (val < minPriceFilter) setMinPriceFilter(val);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span>{minPriceFilter}</span>
                  <span>{maxPriceFilter}</span>
                </div>
              </div>
            </div>
            {Object.keys(modalFilterGroups).length > 0 ? (
              Object.entries(modalFilterGroups).map(([groupName, values]) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="body-02-medium text-text-seconday-default mb-3">
                    {groupName}
                  </h3>
                  {groupName === "Color" ? (
                    <div className="flex flex-wrap gap-2">
                      {values.map((filterString) => {
                        const value = filterString.split(":")[1].trim();
                        const active = activeFilters.includes(filterString);
                        const bgColor = value.startsWith("#")
                          ? value
                          : COLOR_MAP[value] ?? "#cccccc";
                        return (
                          <Button
                            key={filterString}
                            onClick={() => handleFilterToggle(filterString)}
                            aria-label={value}
                            className={`h-8 w-8 rounded-full border ${
                              active ? "ring-2 ring-gray-900" : ""
                            }`}
                            style={{ backgroundColor: bgColor }}
                            variant="primary"
                            size="lg"
                          />
                        );
                      })}
                    </div>
                  ) : groupName === "Talle" ? (
                    <div className="flex flex-wrap gap-2">
                      {values.map((filterString) => {
                        const value = filterString.split(":")[1].trim();
                        const active = activeFilters.includes(filterString);
                        return (
                          <Button
                            key={filterString}
                            onClick={() => handleFilterToggle(filterString)}
                            aria-label={value}
                            className={`h-8 w-8 flex items-center justify-center rounded-full border text-xs ${
                              active
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                            variant="primary"
                            size="lg"
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  ) : groupName === "Colección" ? (
                    <select
                      className="w-full border rounded p-2"
                      value={activeCollection}
                      onChange={(e) => handleCollectionChange(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {values.map((filterString) => {
                        const value = filterString.split(":")[1].trim();
                        return (
                          <option key={filterString} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {values.map((filterString) => (
                        <Button
                          key={filterString}
                          onClick={() => handleFilterToggle(filterString)}
                          className={`px-3 py-1.5 border rounded-full body-02-medium transition-colors ${
                            activeFilters.includes(filterString)
                              ? "text-text-primary-default border-gray-900"
                              : "text-text-secondary-default border-gray-300 hover:bg-gray-100"
                          }`}
                          variant="primary"
                          size="lg"
                        >
                          {filterString.split(":")[1].trim()}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay filtros disponibles.</p>
            )}
          </div>
          <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-2xl">
            <Button
              onClick={() => setActiveFilters([])}
              className="text-sm font-medium text-gray-700 hover:underline"
              variant="primary"
              size="lg"
            >
              Limpiar filtros
            </Button>
            <Button
              onClick={() => setIsFilterModalOpen(false)}
              className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
              variant="primary"
              size="lg"
            >
              Ver {filteredAndSortedProducts.length} productos
            </Button>
          </div>
        </div>
      </div>

      {/* --- Barra de Filtros y Ordenamiento --- */}
      <div className="space-y-4">
        {Object.entries(primaryFilterGroup).map(([groupName, tags]) => (
          <div key={groupName}>
            <div className="flex flex-wrap gap-2 mt-5">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  onClick={() => handleFilterToggle(tag)}
                  className={`px-3 py-1 border rounded-full text-sm font-medium transition-colors ${
                    activeFilters.includes(tag)
                      ? "text-text-primary-default border-border-primary-default"
                      : "text-text-secondary-default border-border-secondary-default hover:bg-gray-100"
                  }`}
                  variant="primary"
                  size="lg"
                >
                  {tag.split(":")[1].trim()}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Grilla de Productos --- */}
      <div className="-mx-6 my-6 h-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-5 ">
        {filteredAndSortedProducts.map((product) => (
          <div
            key={product.handle}
            className="h-full [&>a>div]:px-4 [&>a>div>h3]:mb-4"
          >
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
