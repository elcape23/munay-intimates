"use client";
import React from "react";
import {
  ProductCard,
  ProductCardProps,
} from "@/components/common/product-card";
import { ShopifyProduct } from "@/lib/shopify";

interface RelatedProductsCarouselProps {
  products: ShopifyProduct[];
}

export default function RelatedProductsCarousel({
  products,
}: RelatedProductsCarouselProps) {
  return (
    <section className="">
      <h2 className="heading-06-medium text-text-primary-default">
        Te puede interesar
      </h2>
      <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {products.map((product) => {
          // Mapea ShopifyProduct a las props de ProductCard
          const isNew = product.createdAt
            ? Date.now() - new Date(product.createdAt).getTime() <
              1000 * 3600 * 24 * 30
            : false;
          const cardProps: ProductCardProps = {
            id: product.id,
            title: product.title,
            handle: product.handle,
            imageSrc: product.images.edges[0]?.node.url || "/placeholder.png",
            altText: product.images.edges[0]?.node.altText || product.title,
            price: parseFloat(
              product.priceRange.minVariantPrice.amount
            ).toFixed(0),
            compareAtPrice: product.priceRange.maxVariantPrice.amount
              ? parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(0)
              : undefined,
            colorVariants:
              product.options.find((o) => o.name.toLowerCase() === "color")
                ?.values || [],

            isNew,
          };

          return (
            <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4">
              {products.map((p) => (
                <div
                  key={product.handle}
                  className="snap-start flex-shrink-0 w-64"
                >
                  <ProductCard {...cardProps} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
