// src/components/product/product-analytics.tsx
"use client";

import { useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { trackViewItem } from "@/lib/analytics";
import { trackClarityEvent } from "@/lib/clarity";

export function ProductAnalytics({ product }: { product: ShopifyProduct }) {
  useEffect(() => {
    const variant = product.variants?.edges[0]?.node;
    if (!variant) return;
    trackViewItem({
      item_name: product.title,
      item_id: variant.sku || variant.id,
      price: parseFloat(variant.price.amount),
      quantity: 1,
    });
    trackClarityEvent("view_product", {
      product_handle: product.handle,
      product_title: product.title,
      variant_id: variant.id,
      price: parseFloat(variant.price.amount),
    });
  }, [product]);

  return null;
}
