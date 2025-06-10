// src/app/page.tsx

import { getProducts, ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import Link from "next/link"; // ¡NUEVO! Importamos el componente Link.

// La página de inicio ahora es un componente 'async'.
// Esto nos permite usar 'await' directamente para obtener los datos
// antes de que la página se renderice en el servidor.
export default async function HomePage() {
  // Llamamos a la función que creamos en shopify.ts para obtener los productos.
  const products: ShopifyProduct[] = await getProducts(10);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Nuestros Productos
      </h1>

      {/* Verificamos si la lista de productos está vacía */}
      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          No se encontraron productos. Asegúrate de tener productos activos en
          tu tienda Shopify.
        </p>
      ) : (
        // Si hay productos, los mostramos en una grilla responsive.
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            // ¡MODIFICADO! Envolvemos la tarjeta del producto con un componente Link.
            <Link
              href={`/products/${product.handle}`}
              key={product.handle}
              className="group block"
            >
              <div className="border rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-white h-full flex flex-col">
                <div className="relative w-full h-64">
                  {/* Usamos el componente Image de Next.js para optimización de imágenes */}
                  <Image
                    src={
                      product.images.edges[0]?.node.url || "/placeholder.png"
                    }
                    alt={product.images.edges[0]?.node.altText || product.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {product.title}
                  </h2>
                  <div className="flex-grow"></div>
                  <p className="text-gray-600 mt-2">
                    {/* Formateamos el precio para mostrarlo de forma amigable */}
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: product.priceRange.minVariantPrice.currencyCode,
                    }).format(
                      parseFloat(product.priceRange.minVariantPrice.amount)
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
