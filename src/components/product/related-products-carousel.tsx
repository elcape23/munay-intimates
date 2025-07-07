"use client";
import React from "react";
import {
  ProductCard,
  ProductCardProps,
} from "@/components/common/product-card";
import { ShopifyProduct, FeaturedProduct } from "@/lib/shopify";

type CarouselProduct = ShopifyProduct | FeaturedProduct;

interface RelatedProductsCarouselProps {
  products: CarouselProduct[];
  size?: "default" | "small";
}

export default function RelatedProductsCarousel({
  products,
  size = "default",
}: RelatedProductsCarouselProps) {
  return (
    <section className="space-y-5">
      <h2 className="heading-06-medium text-text-primary-default">
        Completa tu look
      </h2>
      <div
        className={`-m-6 flex space-x-2 overflow-x-auto snap-x snap-mandatory no-scrollbar ${
          size === "small" ? "" : "[&>div>div>a>div:nth-child(2)]:pl-6"
        }`}
      >
        {products.map((product) => {
          let cardProps: ProductCardProps;
          if ("priceRange" in product) {
            // Producto completo de Shopify
            const variant = product.variants?.edges[0]?.node;
            const price = variant?.price?.amount
              ? parseFloat(variant.price.amount).toFixed(0)
              : parseFloat(product.priceRange.minVariantPrice.amount).toFixed(
                  0
                );
            const compareAt = variant?.compareAtPrice?.amount;
            cardProps = {
              id: product.id,
              title: product.title,
              handle: product.handle,
              imageSrc: product.images.edges[0]?.node.url || "/placeholder.png",
              altText: product.images.edges[0]?.node.altText || product.title,
              price,
              compareAtPrice: compareAt
                ? parseFloat(compareAt).toFixed(0)
                : undefined,
              colorVariants:
                product.options.find((o) => o.name.toLowerCase() === "color")
                  ?.values || [],
              isNew: product.isNew,
            };
          } else {
            // FeaturedProduct ya contiene todos los datos necesarios
            cardProps = {
              id: product.id,
              title: product.title,
              handle: product.handle,
              imageSrc: product.imageSrc,
              altText: product.altText,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              colorVariants: product.colorVariants,
              isNew: product.isNew,
            };
          }

          return (
            <div
              key={product.handle}
              className={`snap-start flex-shrink-0 ${
                size === "small" ? "w-48" : "w-64"
              }`}
            >
              <ProductCard {...cardProps} size={size} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
