// src/components/product/ProductForm.tsx

"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";
import { useCartStore } from "@/store/cart-store";
import { COLOR_MAP } from "@/lib/color-map";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type ProductFormProps = {
  product: ShopifyProduct;
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

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaults: Record<string, string> = {};
    productOptions.forEach((option) => {
      if (option.values[0]) {
        defaults[option.name] = option.values[0];
      }
    });
    return defaults;
  });

  // Obtenemos el estado y las acciones directamente desde nuestro store de Zustand.
  const { addItemToCart, isLoading } = useCartStore();
  const router = useRouter();

  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

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
  }, [selectedOptions, product.variants?.edges]);

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

    if (!selectedVariant.availableForSale) {
      toast({ title: "Esta variante no está disponible." });
      return;
    }

    try {
      await addItemToCart(selectedVariant.id);
      toast({ title: "¡Producto añadido al carrito!" });
    } catch (error) {
      toast({ title: "Hubo un error al añadir el producto." });
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast({ title: "Variante no disponible." });
      return;
    }

    if (!selectedVariant.availableForSale) {
      toast({ title: "Esta variante no está disponible." });
      return;
    }

    try {
      await addItemToCart(selectedVariant.id);
      router.push("/checkout");
    } catch (error) {
      toast({ title: "Hubo un error al procesar la compra." });
    }
  };

  const isAddToCartDisabled =
    !selectedVariant || !selectedVariant.availableForSale || isLoading;

  if (!product.variants || product.variants.edges.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-center text-sm text-gray-600">
          No hay variantes disponibles para este producto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selectores de variantes */}
      <div className="space-y-4">
        {productOptions
          .filter((option) => option.name.toLowerCase() !== "tejido")
          .map((option) => {
            const selectedValue = selectedOptions[option.name];

            // ── PERSONALIZADO para “Color”
            if (option.name.toLowerCase() === "color") {
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
                      return (
                        <Button
                          key={value}
                          aria-label={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`w-6 h-6 rounded-full border-[1.5px] ${
                            isActive
                              ? "p-2 border-border-primary-default"
                              : "p-2 border-transparent"
                          }`}
                          style={{ backgroundColor: hex }}
                          variant="ghost"
                          size="icon"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Caso “Talle”: mostrar el valor activo junto al label
            if (
              ["talle", "talla", "size"].includes(option.name.toLowerCase())
            ) {
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
                  <div className="flex flex-row gap-2 items-center">
                    {option.values.map((value) => {
                      const isActive = selectedValue === value;
                      return (
                        <Button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`transition-colors ${
                            isActive
                              ? "p-1 body-01-semibold text-text-primary-default border-b-[2px] border-border-primary-default"
                              : "p-1 text-text-secondary-default border-b-[2px] border-transparent hover:bg-gray-100"
                          }`}
                          variant="ghost"
                          size="icon"
                        >
                          {value}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Resto de opciones (incluyendo “Color”)
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
                    const isActive = selectedOptions[option.name] === value;
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
                      >
                        {option.name.toLowerCase() === "color" && (
                          <span
                            className="inline-block w-4 h-4 rounded-full mr-1 border"
                            style={{
                              backgroundColor: COLOR_MAP[value] ?? value,
                            }}
                          />
                        )}
                        {value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
      {/* Botones de acción */}
      <div ref={buttonContainerRef} className="flex flex-row gap-4">
        <Button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isAddToCartDisabled ? "cursor-not-allowed" : "hover:bg-blue-700"
              }`}
          variant="primary"
          size="lg"
        >
          {isLoading
            ? "Añadiendo..."
            : selectedVariant?.availableForSale
            ? "Añadir"
            : "No Disponible"}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isAddToCartDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isAddToCartDisabled ? "cursor-not-allowed" : "hover:bg-blue-700"
              }`}
          variant="outline"
          size="lg"
        >
          {isLoading
            ? "Añadiendo..."
            : selectedVariant?.availableForSale
            ? "Comprar"
            : "No Disponible"}
        </Button>
      </div>

      {showSticky && (
        <div className="fixed bottom-0 left-0 w-screen h-auto pt-3 pb-9 bg-background-primary-default border-t border-border-tertiary-default z-50 flex items-center justify-between px-6 gap-6">
          <Button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            className={`w-full body-01-semibold py-3 px-6 transition-colors
            ${
              isAddToCartDisabled ? "cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            variant="primary"
            size="lg"
          >
            {isLoading ? "Añadiendo..." : "Añadir"}
          </Button>
          <div className="w-full flex flex-col items-end gap-2">
            <p className="body-01-semibold text-text-primary-default">
              {selectedVariant &&
                new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: selectedVariant.price.currencyCode,
                  maximumFractionDigits: 0,
                }).format(parseFloat(selectedVariant.price.amount))}
            </p>
            <p className="body-03-regular text-text-secondary-default whitespace-nowrap">
              Envío calculado en el checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
