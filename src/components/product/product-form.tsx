// src/components/product/ProductForm.tsx

"use client";

import { useState, useMemo } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";
import { useCartStore } from "@/store/cart-store";
import { COLOR_MAP } from "@/lib/color-map";

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
      ["talle", "size"].includes(o.name.toLowerCase())
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
  const [message, setMessage] = useState(""); // Mantenemos un mensaje local para feedback inmediato

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
    setMessage("");
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setMessage("Variante no disponible.");
      return;
    }

    if (!selectedVariant.availableForSale) {
      setMessage("Esta variante no está disponible.");
      return;
    }

    try {
      await addItemToCart(selectedVariant.id);
      setMessage("¡Producto añadido al carrito!");
    } catch (error) {
      setMessage("Hubo un error al añadir el producto.");
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
        {productOptions.map((option) => (
          <div
            key={option.id}
            className="flex flex-row gap-10 justify-between items-center"
          >
            <label className="block body-01-medium text-gray-700">
              {option.name}
            </label>
            <div className="flex flex-row gap-2 items-center">
              {option.values.map((value) => {
                const isActive = selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={`body-01-regular transition-colors 
                                        ${
                                          isActive
                                            ? "text-text-primary-default border-b-[2px] border-border-primary-default"
                                            : "text-text-secondary-default border-b-[2px] border-transparent hover:bg-gray-100"
                                        }`}
                  >
                    {option.name.toLowerCase() === "color" && (
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-1 border"
                        style={{ backgroundColor: COLOR_MAP[value] ?? value }}
                      />
                    )}
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Botón de Añadir al Carrito */}
      <div className="flex flex-row gap-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isAddToCartDisabled
                  ? "bg-background-fill-neutral-hover text-text-primary-invert cursor-not-allowed"
                  : "bg-background-fill-neutral-default text-text-primary-invert hover:bg-blue-700"
              }`}
        >
          {isLoading
            ? "Añadiendo..."
            : selectedVariant?.availableForSale
            ? "Añadir"
            : "No Disponible"}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className={`w-full body-01-semibold py-3 px-6 transition-colors
              ${
                isAddToCartDisabled
                  ? "bg-transparent text-text-primary-default border cursor-not-allowed"
                  : "bg-transparent text-text-primary-default border border-border-primary-default hover:bg-blue-700"
              }`}
        >
          {isLoading
            ? "Añadiendo..."
            : selectedVariant?.availableForSale
            ? "Comprar"
            : "No Disponible"}
        </button>
      </div>
      {/* Mensajes para el usuario */}
      {message && (
        <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
}
