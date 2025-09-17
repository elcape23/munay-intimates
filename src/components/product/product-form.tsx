// src/components/product/ProductForm.tsx

"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FireIcon } from "@heroicons/react/24/outline";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";
import { useCartStore } from "@/store/cart-store";
import { COLOR_MAP } from "@/lib/color-map";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { trackAddToCart } from "@/lib/analytics";
import { trackClarityEvent } from "@/lib/clarity";

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

  // Obtenemos el estado y las acciones directamente desde nuestro store de Zustand.
  const addItemToCart = useCartStore((s) => s.addItemToCart);

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
  useEffect(() => {
    if (!selectedVariant || !selectedVariant.availableForSale) {
      setQuantity(0);
      return;
    }

    const available = selectedVariant.quantityAvailable;

    if (available === null || available === undefined) {
      setQuantity((prev) => (prev < 1 ? 1 : prev));
      return;
    }

    if (available <= 0) {
      setQuantity(0);
      return;
    }

    setQuantity((prev) => {
      const ensuredMinimum = prev < 1 ? 1 : prev;
      return Math.min(ensuredMinimum, available);
    });
  }, [selectedVariant]);

  const rawAvailableQuantity = selectedVariant?.quantityAvailable;
  const availableQuantity =
    rawAvailableQuantity === undefined ? null : rawAvailableQuantity;
  const hasUnlimitedStock =
    rawAvailableQuantity === null || rawAvailableQuantity === undefined;
  const isVariantAvailable =
    !!selectedVariant &&
    selectedVariant.availableForSale &&
    (hasUnlimitedStock || (rawAvailableQuantity ?? 0) > 0);
  const minimumQuantity = isVariantAvailable ? 1 : 0;
  const canIncreaseQuantity =
    !!selectedVariant &&
    selectedVariant.availableForSale &&
    (hasUnlimitedStock || quantity < (rawAvailableQuantity ?? 0));
  const canDecreaseQuantity = quantity > minimumQuantity;

  const handleDecreaseQuantity = () => {
    if (!canDecreaseQuantity) return;
    setQuantity((prev) => Math.max(prev - 1, minimumQuantity));
  };

  const handleIncreaseQuantity = () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    const available = selectedVariant.quantityAvailable;
    if (available !== undefined && available !== null) {
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
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
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
      const { cart } = useCartStore.getState();
      if (!cart?.checkoutUrl) {
        console.error("checkoutUrl no disponible", cart);
        return;
      }
      window.location.href = cart.checkoutUrl;
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
            {option.values.map((value) => {
              const hex = COLOR_MAP[value] ?? value;
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
                  style={{ backgroundColor: hex }}
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
              {isOneSizeProduct
                ? "Talle único"
                : formatSizeLabel(selectedValue)}{" "}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            {option.values.map((value) => {
              const isActive = selectedValue === value;
              return (
                <Button
                  key={value}
                  onClick={() => handleOptionChange(option.name, value)}
                  className={`relative p-1 transition-colors ${
                    isActive
                      ? "body-01-semibold text-text-primary-default"
                      : "text-text-secondary-default hover:bg-gray-100"
                  }`}
                  variant="ghost"
                  size="icon"
                  data-clarity-label={`Seleccionar ${
                    option.name
                  } ${formatSizeLabel(value)}`}
                >
                  {formatSizeLabel(value)}
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
  const otherVariantOptions = variantOptions.filter(
    (option) => !["talle", "talla", "size"].includes(option.name.toLowerCase())
  );

  const isAddButtonDisabled =
    !isVariantAvailable || loadingButton === "add" || quantity < 1;
  const isBuyButtonDisabled =
    !isVariantAvailable || loadingButton === "buy" || quantity < 1;
  const isLastUnitAvailable = isVariantAvailable && availableQuantity === 1;

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
        {isLastUnitAvailable && (
          <div className="flex items-center gap-2 bg-background-surface-warning-default px-4 py-2 text-text-warning-default">
            <FireIcon className="h-5 w-5" aria-hidden="true" />
            <span className="body-02-semibold">¡Última unidad disponible!</span>
          </div>
        )}
        {sizeVariantOptions.map((option) => renderVariantOption(option))}
        {colorOption && renderVariantOption(colorOption)}
        {/* Cantidad */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="body-01-medium text-text-primary-default">
              Cantidad
            </label>
            <span className="body-01-regular text-text-secondary-default">
              {availableQuantity ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            <span className="body-01-regular w-6 text-center text-text-primary-default">
              {quantity}
            </span>
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
          </div>
        </div>
        {otherVariantOptions.map((option) => renderVariantOption(option))}{" "}
      </div>
      {/* Precio */}
      <div className="flex flex-row justify-between items-center">
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
                  }).format(parseFloat(selectedVariant.compareAtPrice.amount))}
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
