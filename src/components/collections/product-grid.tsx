// src/components/collections/ProductGrid.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ShopifyProduct } from "@/lib/shopify";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProductCard } from "@/components/common/product-card";
import { extractColorVariants } from "@/lib/product-helpers";
import { COLOR_MAP } from "@/lib/color-map";
import { slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SEASONS = ["invierno", "verano", "otono", "primavera"];
const SIZE_ORDER = ["s", "m", "l", "xl", "tu"];

const formatSizeLabel = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized === "talla unica" || normalized === "talle unico"
    ? "TU"
    : value;
};

type ProductGridProps = {
  title: string;
  products: ShopifyProduct[];
};

export function ProductGrid({ title, products }: ProductGridProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState("default");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPriceFilter, setMinPriceFilter] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(0);
  const router = useRouter();
  const showSeasonFilters = title.trim().toLowerCase() === "pijamas";

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
      const seasonSet: Set<string> = showSeasonFilters
        ? new Set(SEASONS)
        : new Set();
      const isWinterSummerTag = (tag: string) => {
        const [group, value] = tag.split(":").map((p) =>
          p
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        );
        if (!group || !value) return false;
        if (group === "subcategoria" || group === "subcategory") {
          return value === "invierno" || value === "verano";
        }
        return false;
      };
      products.forEach((product) => {
        // 1. Procesa las etiquetas (tags) para los filtros principales
        product.tags?.forEach((tag) => {
          const parts = tag.split(":");
          if (
            parts.length === 2 &&
            ["subcategoría", "subcategoria", "subcategory"].includes(
              parts[0].trim().toLowerCase()
            )
          ) {
            if (!showSeasonFilters && isWinterSummerTag(tag)) {
              return;
            }
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

        if (showSeasonFilters) {
          const seasonValue = product.estacion?.value?.toLowerCase();
          if (seasonValue) {
            seasonSet.add(slugify(seasonValue));
          }
        }

        // 3. Procesa metacampos personalizados
        const customMetafields = [product.talle];
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

      const collectionGroup = "Estación";
      if (showSeasonFilters && seasonSet.size > 0) {
        if (!modal[collectionGroup]) modal[collectionGroup] = new Set();
        seasonSet.forEach((season) => {
          modal[collectionGroup].add(`${collectionGroup}:${season}`);
        });
      }

      const primaryResult: Record<string, string[]> = {};
      for (const groupName in primary) {
        primaryResult[groupName] = Array.from(primary[groupName]).sort();
      }
      const modalResult: Record<string, string[]> = {};
      for (const groupName in modal) {
        const values = Array.from(modal[groupName]);
        if (groupName === "Talle") {
          values.sort((a, b) => {
            const labelA = a.split(":")[1].trim();
            const labelB = b.split(":")[1].trim();
            const normA = labelA.toLowerCase();
            const normB = labelB.toLowerCase();
            const indexA = SIZE_ORDER.indexOf(normA);
            const indexB = SIZE_ORDER.indexOf(normB);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return normA.localeCompare(normB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
        } else {
          values.sort();
        }
        modalResult[groupName] = values;
      }

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        primaryFilterGroup: primaryResult,
        modalFilterGroups: modalResult,
        minPrice,
        maxPrice,
      };
    }, [products, showSeasonFilters]);
  useEffect(() => {
    setMinPriceFilter(minPrice);
    setMaxPriceFilter(maxPrice);
  }, [minPrice, maxPrice]);

  const handleFilterToggle = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const activeSeason = useMemo(() => {
    if (!showSeasonFilters) return "";
    const col = activeFilters.find((f) => f.startsWith("Estación:"));
    return col ? col.split(":")[1].trim() : "";
  }, [activeFilters, showSeasonFilters]);

  const handleSeasonChange = (value: string) => {
    if (!showSeasonFilters) return;
    const prefix = "Estación:";
    const season = value === "all" ? "" : value;
    setActiveFilters((prev) => {
      const other = prev.filter((f) => !f.startsWith(prefix));
      return season ? [...other, `${prefix}${season}`] : other;
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

        if (activeSeason) {
          const season = slugify(product.estacion?.value || "");
          if (season !== activeSeason) return false;
        }

        return Object.entries(activeGroups).every(
          ([groupKey, groupFilters]) => {
            return groupFilters.some((filterValue) => {
              const value = filterValue.split(":")[1].trim();
              // Filtra por tag (Subcategoría)
              if (product.tags?.includes(filterValue)) return true;

              // Filtra por metacampos
              const key = groupKey.toLowerCase();
              if (key === "color") {
                const matchesMetafield = product.color?.reference?.fields.some(
                  (f) =>
                    (f.key === "hex" && f.value === value) ||
                    (f.key === "name" && f.value === value) ||
                    (f.key === "value" && f.value === value)
                );

                const colorOption = product.options?.find(
                  (o) => o.name.toLowerCase() === "color"
                );
                const matchesOption = colorOption?.values.some(
                  (v) => v.trim() === value
                );

                const matchesVariant = product.variants?.edges.some((edge) =>
                  edge.node.selectedOptions?.some(
                    (sel) =>
                      sel.name.toLowerCase() === "color" && sel.value === value
                  )
                );

                if (matchesMetafield || matchesOption || matchesVariant) {
                  return true;
                }
              }

              if (["talle", "talla", "size"].includes(key)) {
                const meta = product.talle?.value;
                if (
                  meta &&
                  meta
                    .split(",")
                    .map((v) => v.trim())
                    .includes(value)
                ) {
                  return true;
                }
                const opt = product.options?.find((o) =>
                  ["talle", "talla", "size"].includes(o.name.toLowerCase())
                );
                if (opt && opt.values.some((v) => v.trim() === value)) {
                  return true;
                }
              }

              // @ts-ignore
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
    activeSeason,
    minPrice,
    maxPrice,
  ]);

  const activeFilterCount = activeFilters.length;

  return (
    <div className="relative">
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
          className={`relative py-10 px-6 bg-background-primary-default space-y-10 w-full transition-transform duration-300 transform ${
            isFilterModalOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setActiveFilters([])}
              className="body-02-regular text-text-secondary-default uppercase hover:underline"
              variant="ghost"
              size="text"
            >
              Limpiar filtros
            </Button>
            <Button
              onClick={() => setIsFilterModalOpen(false)}
              variant="ghost"
              size="icon"
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>
          <div className="space-y-10 max-h-[60vh] overflow-y-auto">
            {Object.keys(modalFilterGroups).length > 0 ? (
              Object.entries(modalFilterGroups).map(([groupName, values]) => (
                <div
                  key={groupName}
                  className="space-y-2 flex flex-row justify-between items-center gap-20"
                >
                  <h3 className="body-02-regular uppercase text-text-primary-default">
                    {groupName}
                  </h3>
                  {groupName === "Color" ? (
                    <div className="flex flex-wrap gap-2 pr-[2px]">
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
                            className={`h-6 w-6 items-start rounded-full border ${
                              active
                                ? "ring-[1.5px] ring-offset-[0.5px] ring-border-primary-default"
                                : "border-border-secondary-default"
                            }`}
                            style={{ backgroundColor: bgColor }}
                            variant="ghost"
                            size="icon"
                          />
                        );
                      })}
                    </div>
                  ) : groupName === "Talle" ? (
                    (() => {
                      const numericValues = values.filter((f) => {
                        const v = f.split(":")[1].trim();
                        return /^\d+$/.test(v);
                      });
                      const letterValues = values.filter((f) => {
                        const v = f.split(":")[1].trim();
                        return !/^\d+$/.test(v);
                      });
                      const renderButtons = (vals: string[]) =>
                        vals.map((filterString) => {
                          const value = filterString.split(":")[1].trim();
                          const label = formatSizeLabel(value);
                          const active = activeFilters.includes(filterString);
                          return (
                            <Button
                              key={filterString}
                              onClick={() => handleFilterToggle(filterString)}
                              aria-label={label}
                              className={`h-6 w-6 flex items-start body-02-regular ${
                                active
                                  ? "text-text-primary-default border-b-[2px] border-border-primary-default"
                                  : "body-02-medium text-text-secondary-default border-b-[2px] border-transparent"
                              }`}
                              variant="ghost"
                              size="text"
                            >
                              {label}{" "}
                            </Button>
                          );
                        });
                      return (
                        <div className="flex flex-col gap-2">
                          {numericValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {renderButtons(numericValues)}
                            </div>
                          )}
                          {letterValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {renderButtons(letterValues)}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : groupName === "Estación" && showSeasonFilters ? (
                    <Select
                      value={activeSeason || "all"}
                      onValueChange={(val) =>
                        handleSeasonChange(val === "all" ? "" : val)
                      }
                    >
                      <SelectTrigger className="w-full items-start">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {values.map((filterString) => {
                          const value = filterString.split(":")[1].trim();
                          return (
                            <SelectItem key={filterString} value={value}>
                              {value}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-wrap gap-2 ">
                      {values.map((filterString) => (
                        <Button
                          key={filterString}
                          onClick={() => handleFilterToggle(filterString)}
                          className={`border rounded-full body-02-medium transition-colors ${
                            activeFilters.includes(filterString)
                              ? "text-text-primary-default border-border-secondary-default"
                              : "text-text-secondary-default border-border-secondary-default hover:bg-gray-100"
                          }`}
                          variant="ghost"
                          size="icon"
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
          <div className="flex flex-row gap-20">
            <h3 className="body-02-regular uppercase text-text-primary-default">
              Precio
            </h3>
            <div className="flex flex-col gap-2 w-full">
              <Slider
                min={minPrice}
                max={maxPrice}
                step={1}
                value={[minPriceFilter, maxPriceFilter]}
                onValueChange={(val) => {
                  const [min, max] = val as number[];
                  setMinPriceFilter(min);
                  setMaxPriceFilter(max);
                }}
              />
              <div className="flex justify-between body-03-regular pt-2">
                <span>
                  $
                  {minPriceFilter.toLocaleString("es-AR", {
                    useGrouping: true,
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span>
                  $
                  {maxPriceFilter.toLocaleString("es-AR", {
                    useGrouping: true,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-10">
            <Button
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full hover:bg-background-fill-neutral-hover transition-colors"
              variant="outline"
              size="lg"
            >
              Ver {filteredAndSortedProducts.length} productos
            </Button>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Título renderizado aquí */}
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <Button
              onClick={() => router.back()}
              aria-label="Volver atrás"
              variant="ghost"
              size="icon"
            >
              <ChevronLeftIcon className="h-6 w-6 text-icon-primary-default" />
            </Button>
            <h1 className="body-01-medium uppercase tracking-tight text-text-primary-default">
              {title}
            </h1>
          </div>
          <div className="items-center flex ">
            <Button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1 body-02-regular uppercase text-text-primary-default hover:bg-gray-50"
              variant="ghost"
              size="text"
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

        {/* --- Barra de Filtros y Ordenamiento --- */}
        <div className="space-y-4">
          {Object.entries(primaryFilterGroup).map(([groupName, tags]) => (
            <div key={groupName}>
              <div className="flex flex-nowrap gap-2 mt-5 overflow-x-auto no-scrollbar">
                {" "}
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    onClick={() => handleFilterToggle(tag)}
                    className={`px-3 py-1 border rounded-full body-02-regular transition-colors ${
                      activeFilters.includes(tag)
                        ? "text-text-primary-default border-border-primary-default"
                        : "text-text-secondary-default border-border-secondary-default hover:"
                    }`}
                    variant="outline"
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
            <div key={product.handle} className="h-full [&>div>a>div]:px-4">
              <ProductCard
                key={product.handle}
                id={product.id}
                title={product.title}
                handle={product.handle}
                imageSrc={
                  product.images.edges[0]?.node.url || "/placeholder.png"
                }
                altText={product.images.edges[0]?.node.altText || product.title}
                price={parseFloat(
                  product.priceRange.minVariantPrice.amount
                ).toLocaleString("es-AR", {
                  useGrouping: true,
                  maximumFractionDigits: 0,
                })}
                compareAtPrice={(() => {
                  const cmp =
                    product.variants?.edges[0]?.node.compareAtPrice?.amount ??
                    null;
                  if (!cmp) return undefined;
                  return parseFloat(cmp).toLocaleString("es-AR", {
                    useGrouping: true,
                    maximumFractionDigits: 0,
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
                fill
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
