// src/components/product/ProductForm.tsx

"use client";

import { useState, useMemo } from "react";
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify";
import { useCartStore } from "@/store/cart-store"; // ¡NUEVO! Importamos nuestro store.

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
          <div key={option.id}>
            <label className="block text-sm font-medium text-gray-700">
              {option.name}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isActive = selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors
                                        ${
                                          isActive
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                        }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Botón de Añadir al Carrito */}
      <button
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled}
        className={`w-full font-bold py-3 px-6 rounded-lg transition-colors
              ${
                isAddToCartDisabled
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
      >
        {isLoading
          ? "Añadiendo..."
          : selectedVariant?.availableForSale
          ? "Añadir al Carrito"
          : "No Disponible"}
      </button>

      {/* Mensajes para el usuario */}
      {message && (
        <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
}
