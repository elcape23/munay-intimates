// src/app/products/[handle]/page.tsx

import { getProductByHandle, ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product/product-form"; // ¡NUEVO! Importamos nuestro componente interactivo.

// Esta es una página dinámica. Next.js le pasará los 'params' desde la URL.
export default async function ProductDetailPage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;

  // Obtenemos los datos del producto usando la función que creamos.
  const product: ShopifyProduct | null = await getProductByHandle(handle);

  // Si el producto no se encuentra, mostramos la página 404.
  if (!product) {
    notFound();
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Columna de la Galería de Imágenes */}
        <div className="flex flex-col items-center">
          {/* Imagen Principal */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
            <Image
              src={product.images.edges[0]?.node.url || "/placeholder.png"}
              alt={product.images.edges[0]?.node.altText || product.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          {/* Miniaturas */}
          <div className="flex space-x-2 mt-4">
            {product.images.edges.slice(0, 4).map((edge, index) => (
              <div
                key={edge.node.url}
                className="relative w-20 h-20 rounded border overflow-hidden cursor-pointer"
              >
                <Image
                  src={edge.node.url}
                  alt={`${product.title} - imagen ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Columna de Información y Acciones */}
        <div className="flex flex-col py-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {product.title}
          </h1>

          <p className="text-2xl mt-4 text-gray-800">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: product.priceRange.minVariantPrice.currencyCode,
            }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
          </p>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">Descripción</h2>
            <div
              className="prose prose-lg mt-2 text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* ¡MODIFICADO! Reemplazamos toda la sección de opciones y el botón
              con nuestro nuevo componente de cliente ProductForm.
              Le pasamos los datos del producto como prop. */}
          <div className="mt-8">
            <ProductForm product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
