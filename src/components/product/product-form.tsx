// src/components/product/ProductForm.tsx

"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FireIcon } from "@heroicons/react/24/outline";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";
import { useCartStore } from "@/store/cart-store";
import { getColorStyle } from "@/lib/color-map";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { trackAddToCart } from "@/lib/analytics";
import { trackClarityEvent } from "@/lib/clarity";
import { useRouter } from "next/navigation";

type ProductFormProps = {
  product: ShopifyProduct;
};
type ProductOption = ShopifyProduct["options"][number];
const formatSizeLabel = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized === "talla unica" ? "TU" : value;
};

const isOneSizeValue = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return (
    normalized === "talla unica" ||
    normalized === "talle unico" ||
    normalized === "tu"
  );
};

const shouldExcludeOption = (name: string) => {
  const normalized = name.toLowerCase();
  return (
    normalized === "tejido" ||
    normalized === "estacion" ||
    normalized === "estación" ||
    normalized === "season"
  );
};

export function ProductForm({ product }: ProductFormProps) {
  const productOptions = useMemo(() => {
    const opts = [...product.options];
    const hasColor = opts.some((o) => o.name.toLowerCase() === "color");
    if (!hasColor) {
      const colorField = product.color?.reference?.fields.find(
        (f) => f.key === "name"
      );
      if (colorField?.value) {
        opts.push({ id: "color", name: "Color", values: [colorField.value] });
      }
    }
    const hasTalle = opts.some((o) =>
      ["talle", "talla", "size"].includes(o.name.toLowerCase())
    );
    if (!hasTalle && product.talle?.value) {
      const values = product.talle.value.split(",").map((v) => v.trim());
      opts.push({ id: "talle", name: "Talle", values });
    }
    return opts;
  }, [product]);

  const isOneSizeProduct = useMemo(() => {
    const opt = productOptions.find((o) =>
      ["talle", "talla", "size"].includes(o.name.toLowerCase())
    );
    return !!opt && opt.values.length === 1 && isOneSizeValue(opt.values[0]);
  }, [productOptions]);

  const displayOptions = useMemo(() => {
    const getPriority = (name: string) => {
      const normalized = name.toLowerCase();
      if (["talle", "talla", "size"].includes(normalized)) return 0;
      if (normalized === "color") return 1;
      return 2;
    };

    return [...productOptions].sort(
      (a, b) => getPriority(a.name) - getPriority(b.name)
    );
  }, [productOptions]);

  const firstAvailableVariant = useMemo(() => {
    return (
      product.variants?.edges.find(
        (e) => e.node.availableForSale && (e.node.quantityAvailable ?? 0) > 0
      )?.node || product.variants?.edges[0]?.node
    );
  }, [product.variants?.edges]);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaults: Record<string, string> = {};
    const variantValues = firstAvailableVariant?.title.split(" / ") || [];
    productOptions.forEach((option, index) => {
      if (variantValues[index]) {
        defaults[option.name] = variantValues[index];
      } else if (option.values[0]) {
        defaults[option.name] = option.values[0];
      }
    });
    return defaults;
  });

  const cart = useCartStore((s) => s.cart);
  const addItemToCart = useCartStore((s) => s.addItemToCart);
  const router = useRouter();

  const [loadingButton, setLoadingButton] = useState<"add" | "buy" | null>(
    null
  );

  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const initialQuantity = useMemo(() => {
    if (!firstAvailableVariant) return 0;

    const available = firstAvailableVariant.quantityAvailable;
    const hasStock =
      firstAvailableVariant.availableForSale &&
      (available === null || available === undefined || available > 0);

    return hasStock ? 1 : 0;
  }, [firstAvailableVariant]);
  const [quantity, setQuantity] = useState(initialQuantity);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      {
        // Show the sticky modal as soon as the button block starts
        // leaving the viewport, not only when it is completely hidden.
        threshold: 0,
      }
    );

    const current = buttonContainerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const selectedVariant: ShopifyProductVariant | undefined = useMemo(() => {
    if (!product.variants) return undefined;
    if (product.variants.edges.length === 1) {
      return product.variants.edges[0].node;
    }
    return product.variants.edges.find(({ node }) =>
      Object.entries(selectedOptions).every(([name, value]) =>
        node.title.includes(value)
      )
    )?.node;
  }, [selectedOptions, product.variants]);
  const selectedVariantId = selectedVariant?.id;
  const quantityAlreadyInCart = useMemo(() => {
    if (!cart || !selectedVariantId) return 0;

    return cart.lines.edges.reduce((total, { node }) => {
      return node.merchandise.id === selectedVariantId
        ? total + node.quantity
        : total;
    }, 0);
  }, [cart, selectedVariantId]);
  const remainingAvailableQuantity = useMemo(() => {
    if (
      !selectedVariant ||
      selectedVariant.quantityAvailable === null ||
      selectedVariant.quantityAvailable === undefined
    ) {
      return null;
    }

    return Math.max(
      selectedVariant.quantityAvailable - quantityAlreadyInCart,
      0
    );
  }, [quantityAlreadyInCart, selectedVariant]);
  const hasUnlimitedStock = remainingAvailableQuantity === null;
  useEffect(() => {
    if (!selectedVariant || !selectedVariant.availableForSale) {
      setQuantity(0);
      return;
    }

    if (hasUnlimitedStock) {
      setQuantity((prev) => (prev < 1 ? 1 : prev));
      return;
    }

    const available = remainingAvailableQuantity ?? 0;
    if (available <= 0) {
      setQuantity(0);
      return;
    }

    setQuantity((prev) => {
      const ensuredMinimum = prev < 1 ? 1 : prev;
      return Math.min(ensuredMinimum, available);
    });
  }, [hasUnlimitedStock, remainingAvailableQuantity, selectedVariant]);

  const hasMultipleVariants = (product.variants?.edges.length ?? 0) > 1;
  const hasEnoughStockForQuantityControls =
    hasUnlimitedStock || (remainingAvailableQuantity ?? 0) > 1;
  const shouldShowQuantityControls =
    hasMultipleVariants && hasEnoughStockForQuantityControls;
  const isVariantAvailable =
    !!selectedVariant &&
    selectedVariant.availableForSale &&
    (hasUnlimitedStock || (remainingAvailableQuantity ?? 0) > 0);
  const minimumQuantity = isVariantAvailable ? 1 : 0;
  const canIncreaseQuantity =
    !!selectedVariant &&
    selectedVariant.availableForSale &&
    (hasUnlimitedStock || quantity < (remainingAvailableQuantity ?? 0));
  const canDecreaseQuantity = quantity > minimumQuantity;

  const handleDecreaseQuantity = () => {
    if (!canDecreaseQuantity) return;
    setQuantity((prev) => Math.max(prev - 1, minimumQuantity));
  };

  const handleIncreaseQuantity = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    if (!hasUnlimitedStock) {
      const available = remainingAvailableQuantity ?? 0;
      if (available <= 0 || quantity >= available) {
        toast({ title: "No hay más stock disponible." });
        return;
      }
    }
    setQuantity((prev) => {
      const next = prev + 1;
      return next < 1 ? 1 : next;
    });
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => {
      const nextOptions = {
        ...prev,
        [optionName]: value,
      };

      const isSizeOption = sizeOptionNames.has(optionName);

      if (isSizeOption && colorOption) {
        const availableColorsForNextSize =
          availableColorsBySize?.get(value) ?? null;

        if (availableColorsForNextSize && availableColorsForNextSize.size > 0) {
          const previousColor = prev[colorOption.name];
          const colorIsStillAvailable =
            previousColor && availableColorsForNextSize.has(previousColor);

          if (!colorIsStillAvailable) {
            const [fallbackColor] = Array.from(availableColorsForNextSize);
            if (fallbackColor) {
              nextOptions[colorOption.name] = fallbackColor;
            }
          }
        }
      }

      return nextOptions;
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({ title: "Variante no disponible." });
      return;
    }

    if (
      !selectedVariant.availableForSale ||
      (selectedVariant.quantityAvailable ?? 0) <= 0
    ) {
      toast({ title: "Esta variante no está disponible." });
      return;
    }

    if (quantity < 1) {
      toast({ title: "Seleccioná al menos una unidad." });
      return;
    }

    if (!hasUnlimitedStock) {
      const available = remainingAvailableQuantity ?? 0;
      if (available <= 0) {
        toast({
          title: "Ya agregaste todas las unidades disponibles a tu carrito.",
        });
        return;
      }

      if (quantity > available) {
        toast({
          title: `Solo hay ${available} unidades disponibles.`,
        });
        return;
      }
    }

    if (
      selectedVariant.quantityAvailable !== null &&
      selectedVariant.quantityAvailable !== undefined &&
      quantity > selectedVariant.quantityAvailable
    ) {
      toast({
        title: `Solo hay ${selectedVariant.quantityAvailable} unidades disponibles.`,
      });
      return;
    }

    try {
      setLoadingButton("add");
      await addItemToCart(selectedVariant.id, quantity);
      trackAddToCart({
        item_name: product.title,
        item_id: selectedVariant.sku || selectedVariant.id,
        price: parseFloat(selectedVariant.price.amount),
        quantity: 1,
      });
      trackClarityEvent("add_to_cart", {
        product_handle: product.handle,
        product_title: product.title,
        variant_id: selectedVariant.id,
        variant_title: selectedVariant.title,
        price: parseFloat(selectedVariant.price.amount),
        quantity,
      });
      toast({ title: "¡Producto añadido al carrito!" });
    } catch (error) {
      toast({ title: "Hubo un error al añadir el producto." });
    } finally {
      setLoadingButton(null);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast({ title: "Variante no disponible." });
      return;
    }

    if (quantity < 1) {
      toast({ title: "Seleccioná al menos una unidad." });
      return;
    }

    if (!hasUnlimitedStock) {
      const available = remainingAvailableQuantity ?? 0;
      if (available <= 0) {
        toast({
          title: "Ya agregaste todas las unidades disponibles a tu carrito.",
        });
        return;
      }

      if (quantity > available) {
        toast({
          title: `Solo hay ${available} unidades disponibles.`,
        });
        return;
      }
    }

    if (
      selectedVariant.quantityAvailable !== null &&
      selectedVariant.quantityAvailable !== undefined &&
      quantity > selectedVariant.quantityAvailable
    ) {
      toast({
        title: `Solo hay ${selectedVariant.quantityAvailable} unidades disponibles.`,
      });
      return;
    }

    if (
      !selectedVariant.availableForSale ||
      (selectedVariant.quantityAvailable ?? 0) <= 0
    ) {
      toast({ title: "Esta variante no está disponible." });
      return;
    }

    try {
      setLoadingButton("buy");
      await addItemToCart(selectedVariant.id, quantity);
      trackAddToCart({
        item_name: product.title,
        item_id: selectedVariant.sku || selectedVariant.id,
        price: parseFloat(selectedVariant.price.amount),
        quantity,
      });
      trackClarityEvent("add_to_cart", {
        product_handle: product.handle,
        product_title: product.title,
        variant_id: selectedVariant.id,
        variant_title: selectedVariant.title,
        price: parseFloat(selectedVariant.price.amount),
        quantity,
      });
      router.push("/checkout");
    } catch (error) {
      toast({ title: "Hubo un error al procesar la compra." });
    } finally {
      setLoadingButton(null);
    }
  };

  const renderVariantOption = (option: ProductOption) => {
    const selectedValue = selectedOptions[option.name];
    const normalizedName = option.name.toLowerCase();

    if (normalizedName === "color") {
      const valuesToRender =
        colorOption && colorOption.name === option.name
          ? filteredColorValues
          : option.values;
      return (
        <div
          key={option.id}
          className="flex flex-row justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <label className="body-01-medium text-text-primary-default">
              {option.name}
            </label>
            <span className="body-01-regular text-text-secondary-default">
              {selectedValue}
            </span>
          </div>
          <div className="flex gap-3 mt-2">
            {valuesToRender.map((value) => {
              const isActive = selectedValue === value;
              const isBlack = value.toLowerCase() === "negro";
              const isWhite = value.toLowerCase() === "blanco";
              const activeBorderClass = isBlack
                ? "ring-[1.5px] ring-offset-[0.5px] ring-border-primary-default"
                : "ring-[1.5px] ring-offset-[0.5px] ring-border-primary-default";
              return (
                <Button
                  key={value}
                  aria-label={value}
                  onClick={() => handleOptionChange(option.name, value)}
                  className={`w-6 h-6 rounded-full border-[1.5px] ${
                    isActive ? `p-2 ${activeBorderClass}` : "p-2"
                  } ${
                    isWhite
                      ? "border-border-tertiary-default"
                      : "border-transparent"
                  }`}
                  style={getColorStyle(value)}
                  variant="ghost"
                  size="icon"
                  data-clarity-label={`Seleccionar color ${value}`}
                />
              );
            })}
          </div>
        </div>
      );
    }

    if (["talle", "talla", "size"].includes(normalizedName)) {
      const sizeAvailability = sizeAvailabilityMap.get(option.name);
      const hasAvailabilityInfo = sizeAvailabilityMap.size > 0;
      return (
        <div
          key={option.id}
          className="flex flex-row justify-between items-center h-8"
        >
          <div className="flex items-center gap-2">
            <label className="body-01-medium text-text-primary-default">
              {option.name}
            </label>
            <span className="body-01-regular text-text-secondary-default">
              {isOneSizeProduct
                ? "Talle único"
                : formatSizeLabel(selectedValue)}{" "}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            {option.values.map((value) => {
              const isValueAvailable = hasAvailabilityInfo
                ? sizeAvailability?.get(value) === true
                : true;
              const isActive = isValueAvailable && selectedValue === value;
              return (
                <Button
                  key={value}
                  disabled={!isValueAvailable}
                  onClick={() => handleOptionChange(option.name, value)}
                  className={`relative p-1 transition-colors ${
                    isActive
                      ? "body-01-semibold text-text-primary-default"
                      : "text-text-secondary-default hover:bg-gray-100"
                  } ${!isValueAvailable ? "disabled:text-text-disabled" : ""}`}
                  variant="ghost"
                  size="icon"
                  data-clarity-label={`Seleccionar ${
                    option.name
                  } ${formatSizeLabel(value)}`}
                >
                  <span>{formatSizeLabel(value)}</span>
                  {!isValueAvailable && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[1px] w-6 -translate-x-1/2 -translate-y-1/2 bg-border-primary-default"
                    />
                  )}{" "}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="absolute left-0 bottom-0 h-[2px] bg-border-primary-default"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                </Button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        key={option.id}
        className="flex flex-row gap-10 justify-between items-center"
      >
        <label className="block body-01-medium text-text-primary-default">
          {option.name}
        </label>
        <div className="flex flex-row items-center">
          {option.values.map((value) => {
            const isActive = selectedValue === value;
            return (
              <Button
                key={value}
                onClick={() => handleOptionChange(option.name, value)}
                className={`m-2 body-01-semibold transition-colors
                        ${
                          isActive
                            ? "text-text-primary-default border-b-[2px] border-border-primary-default"
                            : "body-01-medium text-text-secondary-default border-b-[2px] border-transparent hover:bg-gray-100"
                        }`}
                variant="ghost"
                size="icon"
                data-clarity-label={`Seleccionar ${option.name} ${value}`}
              >
                {value}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  const filteredOptions = displayOptions.filter(
    (option) => !shouldExcludeOption(option.name)
  );
  const colorOption = filteredOptions.find(
    (option) => option.name.toLowerCase() === "color"
  );
  const variantOptions = filteredOptions.filter(
    (option) => option.name.toLowerCase() !== "color"
  );

  const sizeVariantOptions = variantOptions.filter((option) =>
    ["talle", "talla", "size"].includes(option.name.toLowerCase())
  );
  const sizeAvailabilityMap = useMemo(() => {
    const availability = new Map<string, Map<string, boolean>>();

    if (!sizeVariantOptions.length) {
      return availability;
    }

    const normalizedNameToOriginal = new Map<string, string>();

    for (const option of sizeVariantOptions) {
      normalizedNameToOriginal.set(option.name.toLowerCase(), option.name);
      const valuesMap = new Map<string, boolean>();
      for (const value of option.values) {
        valuesMap.set(value, false);
      }
      availability.set(option.name, valuesMap);
    }

    if (!product.variants?.edges?.length) {
      return availability;
    }

    for (const { node: variant } of product.variants.edges) {
      const hasStock =
        variant.availableForSale &&
        (variant.quantityAvailable === null ||
          variant.quantityAvailable === undefined ||
          variant.quantityAvailable > 0);

      if (!hasStock) {
        continue;
      }

      const optionsFromVariant =
        variant.selectedOptions && variant.selectedOptions.length > 0
          ? variant.selectedOptions
          : product.options.map((option, index) => ({
              name: option.name,
              value: variant.title.split(" / ")[index] ?? "",
            }));

      for (const selectedOption of optionsFromVariant) {
        const originalName = normalizedNameToOriginal.get(
          selectedOption.name.toLowerCase()
        );
        if (!originalName) continue;

        const valuesMap = availability.get(originalName);
        if (!valuesMap) continue;

        valuesMap.set(selectedOption.value, true);
      }
    }

    return availability;
  }, [product.options, product.variants?.edges, sizeVariantOptions]);
  const sizeOptionNames = useMemo(
    () => new Set(sizeVariantOptions.map((option) => option.name)),
    [sizeVariantOptions]
  );
  const primarySizeOption = sizeVariantOptions[0];
  const selectedSizeValue = primarySizeOption
    ? selectedOptions[primarySizeOption.name]
    : undefined;
  const selectedColorValue = colorOption
    ? selectedOptions[colorOption.name]
    : undefined;

  const availableColorsBySize = useMemo(() => {
    if (
      !primarySizeOption ||
      !colorOption ||
      !product.variants?.edges?.length
    ) {
      return null;
    }

    const sizeName = primarySizeOption.name.toLowerCase();
    const colorName = colorOption.name.toLowerCase();
    const map = new Map<string, Set<string>>();
    for (const { node: variant } of product.variants.edges) {
      if (
        !variant.availableForSale ||
        (variant.quantityAvailable !== null &&
          variant.quantityAvailable !== undefined &&
          variant.quantityAvailable <= 0)
      ) {
        continue;
      }

      const optionsFromVariant =
        variant.selectedOptions && variant.selectedOptions.length > 0
          ? variant.selectedOptions
          : product.options.map((option, index) => ({
              name: option.name,
              value: variant.title.split(" / ")[index] ?? "",
            }));

      const variantSizeValue = optionsFromVariant.find(
        (opt) => opt.name.toLowerCase() === sizeName
      )?.value;
      const variantColorValue = optionsFromVariant.find(
        (opt) => opt.name.toLowerCase() === colorName
      )?.value;

      if (!variantSizeValue || !variantColorValue) {
        continue;
      }

      if (!map.has(variantSizeValue)) {
        map.set(variantSizeValue, new Set<string>());
      }

      map.get(variantSizeValue)?.add(variantColorValue);
    }

    return map;
  }, [
    colorOption,
    primarySizeOption,
    product.options,
    product.variants?.edges,
  ]);

  const availableColorsForSelectedSize = useMemo(() => {
    if (!selectedSizeValue || !availableColorsBySize) {
      return null;
    }

    return availableColorsBySize.get(selectedSizeValue) ?? null;
  }, [availableColorsBySize, selectedSizeValue]);

  const filteredColorValues = useMemo(() => {
    if (!colorOption) return [] as string[];
    if (!availableColorsForSelectedSize) return colorOption.values;
    return colorOption.values.filter((value) =>
      availableColorsForSelectedSize.has(value)
    );
  }, [availableColorsForSelectedSize, colorOption]);

  useEffect(() => {
    if (!colorOption) return;
    if (!filteredColorValues.length) return;
    if (
      selectedColorValue &&
      filteredColorValues.includes(selectedColorValue)
    ) {
      return;
    }

    setSelectedOptions((prev) => ({
      ...prev,
      [colorOption.name]: filteredColorValues[0],
    }));
  }, [colorOption, filteredColorValues, selectedColorValue]);
  const otherVariantOptions = variantOptions.filter(
    (option) => !["talle", "talla", "size"].includes(option.name.toLowerCase())
  );
  const isAddButtonDisabled =
    !isVariantAvailable || loadingButton === "add" || quantity < 1;
  const isBuyButtonDisabled =
    !isVariantAvailable || loadingButton === "buy" || quantity < 1;
  const isLastUnitAvailable =
    isVariantAvailable && remainingAvailableQuantity === 1;
  const availabilityLabel = hasUnlimitedStock
    ? "—"
    : `${remainingAvailableQuantity ?? 0} ${
        remainingAvailableQuantity === 1 ? "Disponible" : "Disponibles"
      }`;

  const addButtonLabel =
    loadingButton === "add"
      ? "Añadiendo..."
      : isVariantAvailable
      ? "Añadir"
      : "Sin Stock";

  const buyButtonLabel =
    loadingButton === "buy"
      ? "Añadiendo..."
      : isVariantAvailable
      ? "Comprar"
      : "Sin Stock";

  if (!product.variants || product.variants.edges.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-center body-03-regular text-text-secondary-default">
          No hay variantes disponibles para este producto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selectores de variantes */}
      <div className="space-y-4">
        <div className="min-h-[48px]">
          <AnimatePresence initial={false}>
            {isLastUnitAvailable && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 bg-background-surface-warning-default px-4 py-2 text-text-warning-default"
              >
                <FireIcon className="h-5 w-5" aria-hidden="true" />
                <span className="body-02-semibold">
                  ¡Última unidad disponible!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {sizeVariantOptions.map((option) => renderVariantOption(option))}
        {colorOption && renderVariantOption(colorOption)}
        {/* Cantidad */}
        <div className="flex flex-row justify-between items-center h-8">
          <div className="flex items-center gap-2">
            <label className="body-01-medium text-text-primary-default">
              Cantidad
            </label>
            <span className="body-01-regular text-text-secondary-default">
              {availabilityLabel}{" "}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {shouldShowQuantityControls && (
              <Button
                onClick={handleDecreaseQuantity}
                disabled={!canDecreaseQuantity}
                className="w-10 h-10 heading-05-regular leading-none"
                variant="ghost"
                size="icon"
                aria-label="Disminuir cantidad"
                data-clarity-label="Disminuir cantidad"
              >
                -
              </Button>
            )}
            <span className="body-01-regular w-6 text-center text-text-primary-default">
              {quantity}
            </span>
            {shouldShowQuantityControls && (
              <Button
                onClick={handleIncreaseQuantity}
                disabled={!canIncreaseQuantity}
                className="w-10 h-10 heading-05-regular leading-none"
                variant="ghost"
                size="icon"
                aria-label="Aumentar cantidad"
                data-clarity-label="Aumentar cantidad"
              >
                +
              </Button>
            )}
          </div>
        </div>
        {otherVariantOptions.map((option) => renderVariantOption(option))}{" "}
        {/* Precio */}
        <div className="flex flex-row justify-between items-center h-8">
          <label className="body-01-medium text-text-primary-default">
            Precio
          </label>
          <div className="flex items-center gap-2">
            {selectedVariant && selectedVariant.price && (
              <>
                {selectedVariant.compareAtPrice && (
                  <span className="body-01-semibold line-through text-text-secondary-default">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: selectedVariant.compareAtPrice.currencyCode,
                      maximumFractionDigits: 0,
                    }).format(
                      parseFloat(selectedVariant.compareAtPrice.amount)
                    )}
                  </span>
                )}
                <span className="body-01-semibold text-text-primary-default">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: selectedVariant.price.currencyCode,
                    maximumFractionDigits: 0,
                  }).format(parseFloat(selectedVariant.price.amount))}{" "}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div ref={buttonContainerRef} className="flex flex-row gap-4">
        <Button
          onClick={handleAddToCart}
          disabled={isAddButtonDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isAddButtonDisabled
                  ? "cursor-not-allowed"
                  : "hover:bg-background-fill-neutral-default"
              }`}
          variant="primary"
          size="lg"
          data-clarity-label="Agregar producto al carrito"
        >
          {addButtonLabel}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isBuyButtonDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isBuyButtonDisabled
                  ? "cursor-not-allowed"
                  : "hover:bg-background-fill-neutral-default"
              }
              text-text-primary-default hover:text-text-primary-invert`}
          variant="outline"
          size="lg"
          data-clarity-label="Comprar ahora"
        >
          {buyButtonLabel}
        </Button>
      </div>

      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 w-screen h-auto pt-3 pb-9 bg-background-primary-default border-t border-border-tertiary-default z-50 flex items-center justify-between px-6 gap-6"
          >
            <Button
              onClick={handleAddToCart}
              disabled={isAddButtonDisabled}
              className={`w-full body-01-semibold py-3 px-6 transition-colors
            ${
              isAddButtonDisabled
                ? "cursor-not-allowed"
                : "hover:bg-background-fill-neutral-default"
            }`}
              variant="primary"
              size="lg"
              data-clarity-label="Agregar producto al carrito (fijo)"
            >
              {addButtonLabel}
            </Button>
            <div className="w-full flex flex-col items-end gap-2">
              <p className="body-01-semibold text-text-primary-default">
                {selectedVariant && selectedVariant.compareAtPrice ? (
                  <>
                    <span className="mr-2 line-through text-text-secondary-default">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: selectedVariant.compareAtPrice.currencyCode,
                        maximumFractionDigits: 0,
                      }).format(
                        parseFloat(selectedVariant.compareAtPrice.amount)
                      )}
                    </span>
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: selectedVariant.price.currencyCode,
                      maximumFractionDigits: 0,
                    }).format(parseFloat(selectedVariant.price.amount))}
                  </>
                ) : (
                  selectedVariant &&
                  new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: selectedVariant.price.currencyCode,
                    maximumFractionDigits: 0,
                  }).format(parseFloat(selectedVariant.price.amount))
                )}
              </p>
              <p className="body-03-regular text-text-secondary-default whitespace-nowrap">
                Envío calculado en el checkout
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
