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
    <section className="space-y-5">
      <h2 className="heading-06-medium text-text-primary-default">
        Te puede interesar
      </h2>
      <div className="-m-6 flex space-x-2 overflow-x-auto snap-x snap-mandatory no-scrollbar [&>div>a>div:nth-child(2)]:ml-4">
        {products.map((product) => {
          // Mapea ShopifyProduct a las props de ProductCard
          const variant = product.variants?.edges[0]?.node;
          const price = variant?.price?.amount
            ? parseFloat(variant.price.amount).toFixed(0)
            : parseFloat(product.priceRange.minVariantPrice.amount).toFixed(0);
          const compareAt = variant?.compareAtPrice?.amount;
          const cardProps: ProductCardProps = {
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

          return (
            <div key={product.handle} className="snap-start flex-shrink-0 w-64">
              <ProductCard {...cardProps} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
