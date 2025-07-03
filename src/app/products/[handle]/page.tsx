// src/app/products/[handle]/page.tsx

import { getProductByHandle, getRecommendedProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product/product-form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import RelatedProductsCarousel from "@/components/product/related-products-carousel";
import ProductGallery from "@/components/product/product-gallery";
import { COLOR_MAP } from "@/lib/color-map";
import { Footer } from "@/components/common/footer";
import SlideUpSection from "@/components/common/slide-up-section";

// Esta es una página dinámica. Next.js le pasará los 'params' desde la URL.
export default async function ProductDetailPage({
  params,
}: {
  params: { handle: string };
}) {
  // 1️⃣ Trae el producto principal
  const product = await getProductByHandle(params.handle);
  console.log("TAGS:", product?.tags);
  if (!product) notFound();

  // 2️⃣ Averigua el handle de su primera colección (o la que prefieras)
  const firstCollectionHandle = product.collections?.edges?.[0]?.node.handle;

  const relatedProducts = await getRecommendedProducts(product.id, 4);

  return (
    <SlideUpSection className="mx-6 grid grid-cols-1 gap-y-6 gap-x-6 no-scrollbar mb-24">
      {/* Columna de la Galería de Imágenes */}
      {/* ▶ Carrusel principal */}
      <ProductGallery
        images={product.images.edges}
        productHandle={product.handle}
      />
      {/* Columna de Información y Acciones */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-row">
            <h1 className="heading-06-medium text-text-primary-default">
              {product.title}
            </h1>
            {/* Badge “NEW” si el producto tiene el tag “New” */}
            {product.isNew && (
              <span className="body-02-regular ml-[2px] uppercase text-text-primary-default">
                NEW
              </span>
            )}
          </div>

          {/* Dot del primer color + “+N” de colores restantes */}
          {(() => {
            const colorOption = product.options.find(
              (opt) => opt.name === "Color"
            );
            const colorValues = colorOption?.values ?? [];
            if (colorValues.length === 0) return null;
            const firstColor = colorValues[0];
            const othersCount = colorValues.length - 1;
            return (
              <div className="ml-4 flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-full border"
                  style={{
                    backgroundColor: COLOR_MAP[firstColor] ?? firstColor,
                  }}
                />
                {othersCount > 0 && (
                  <span className="body-01-regular text-text-primary-default">
                    +{othersCount}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
        {/* ► Título grande */}
        {/* ► Botón de Favoritos */}
        {product.productType && (
          <span className="body-02-medium text-text-secondary-default">
            {product.productType}
          </span>
        )}
        {/* ► Descripción corta (opcional) */}
        <div className="body-02-regular text-text-secondary-default">
          <div
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml || "",
            }}
          />
        </div>
      </div>

      {/* ► Formulario de selección (color, talle, añadir/comprar) */}
      <div className="bg-background-primary-default">
        <ProductForm product={product} />
      </div>
      {/* ► Secciones desplegables */}
      <div className="flex flex-col gap-4">
        {/* Acorddion #1 */}
        <div className="justify-between">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Medidas del producto</AccordionTrigger>
              <AccordionContent>…contenido…</AccordionContent>
            </AccordionItem>
            {/* …más items… */}
          </Accordion>
        </div>
        {/* Acorddion #2 */}
        <div className="justify-between">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-2">
              <AccordionTrigger>Composición, cuidado & origen</AccordionTrigger>
              <AccordionContent>…contenido…</AccordionContent>
            </AccordionItem>
            {/* …más items… */}
          </Accordion>
        </div>
        {/* Acorddion #3 */}
        <div className="justify-between">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Envíos, cambios & devoluciones
              </AccordionTrigger>
              <AccordionContent>…contenido…</AccordionContent>
            </AccordionItem>
            {/* …más items… */}
          </Accordion>
        </div>
        {/* Acorddion #4 */}
        <div className="justify-between">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-4">
              <AccordionTrigger>Disponibilidad en tienda</AccordionTrigger>
              <AccordionContent>…contenido…</AccordionContent>
            </AccordionItem>
            {/* …más items… */}
          </Accordion>
        </div>
      </div>
      {/* ► Productos relacionados */}
      <div>
        <RelatedProductsCarousel products={relatedProducts} />
      </div>
      <Footer />
    </SlideUpSection>
  );
}
