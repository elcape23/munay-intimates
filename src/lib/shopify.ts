// src/lib/shopify.ts

import { GraphQLClient, gql } from "graphql-request";

// --- Configuración ---
const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!storeDomain || !storefrontAccessToken || !appUrl) {
  throw new Error(
    "Las variables de entorno de Shopify (dominio, token y URL de la app) no están configuradas."
  );
}

const shopifyApiEndpoint = `https://${storeDomain}/api/2024-04/graphql.json`;

const shopifyClient = new GraphQLClient(shopifyApiEndpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    "Content-Type": "application/json",
    Origin: appUrl,
  },
});

// --- Definiciones de Tipos de Datos (Completas) ---
export type ShopifyImage = { url: string; altText: string | null };
export type ShopifyPrice = { amount: string; currencyCode: string };
export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyPrice;
  compareAtPrice?: ShopifyPrice;
  selectedOptions?: { name: string; value: string }[];
};
export type ShopifyProductOption = {
  id: string;
  name: string;
  values: string[];
};
export type ShopifyMetafield = {
  key: string;
  value: string;
  reference?: {
    fields: { key: string; value: string }[];
  };
};
export type ShopifyProduct = {
  id: string;
  title: string;
  productType?: string | null;
  handle: string;
  tags: string[];
  createdAt?: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
  isNew: boolean;
  images: { edges: { node: ShopifyImage }[] };
  options: ShopifyProductOption[];
  variants?: { edges: { node: ShopifyProductVariant }[] };
  color?: ShopifyMetafield | null;
  talle?: ShopifyMetafield | null;
  estacion?: ShopifyMetafield | null;
  collections?: {
    edges: { node: { id: string; title: string; handle: string } }[];
  };
};
export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyPrice };
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string };
    image: ShopifyImage;
  };
};
export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: { subtotalAmount: ShopifyPrice; totalAmount: ShopifyPrice };
  lines: { edges: { node: ShopifyCartLine }[] };
  totalQuantity: number;
};
export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};
export type CustomerAccessToken = { accessToken: string; expiresAt: string };
export type CustomerUserError = {
  code: string;
  field: string[];
  message: string;
};
export type OrderLineItem = {
  title: string;
  quantity: number;
  variant: {
    title: string;
    image: { url: string; altText: string | null };
  } | null;
};
export type ShopifyOrder = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: ShopifyPrice;
  lineItems: { edges: { node: OrderLineItem }[] };
};
export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  products: {
    edges: { node: ShopifyProduct }[];
  };
};

// Tipos para las respuestas de la API
type GetProductsResponse = { products: { edges: { node: ShopifyProduct }[] } };
type GetProductByHandleResponse = { product: ShopifyProduct };
type GetCollectionsResponse = {
  collections: { edges: { node: ShopifyCollection }[] };
};
type GetCollectionByHandleResponse = { collection: ShopifyCollection };
type CreateCartResponse = { cartCreate: { cart: ShopifyCart } };
type AddToCartResponse = { cartLinesAdd: { cart: ShopifyCart } };
type GetCartResponse = { cart: ShopifyCart };

// --- Función Principal de Peticiones ---
export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<T> {
  try {
    return await shopifyClient.request<T>(query, variables);
  } catch (error: any) {
    // 1) Imprimimos a consola el error original (servidor)
    console.error("🚨 Shopify error:", error.response?.errors || error);

    // 2) Relanzamos con toda la información para verlo en el navegador
    const message = Array.isArray(error.response?.errors)
      ? error.response.errors.map((e: any) => e.message).join("; ")
      : error.message;
    throw new Error(`Shopify GraphQL failed: ${message}`);
  }
}

// --- Funciones de Navegación / Menú ---

export type ShopifyMenuItem = {
  id: string;
  title: string;
  url: string; // ↘️  la convertimos a path relativo
  section: "categories" | "new" | "collections";
  isNew: boolean;
};

/**
 * Devuelve los ítems del menú “main-menu” definidos en tu tienda Shopify.
 *  - Usa dos metafields opcionales:
 *      • custom.section  → "categories" | "new" | "collections"
 *      • custom.is_new   → "true" / "false"  (muestra badge NEW)
 */
export async function getMenu(
  handle: string = "main-menu"
): Promise<ShopifyMenuItem[]> {
  const MENU_QUERY = gql`
    query Menu($handle: String!) {
      menu(handle: $handle) {
        items {
          id
          title
          url # ← ej. https://tu-tienda/...
          section: metafield(namespace: "custom", key: "section") {
            value
          }
          isNew: metafield(namespace: "custom", key: "is_new") {
            value
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    menu: { items: any[] } | null;
  }>({ query: MENU_QUERY, variables: { handle } });

  if (!data.menu?.items) return [];

  return data.menu.items.map((item) => ({
    id: item.id,
    title: item.title,
    // quitamos el dominio para obtener path relativo
    url: item.url.replace(/^https?:\/\/[^/]/, ""),
    section: (item.section?.value as any) ?? "categories",
    isNew: item.isNew?.value === "true",
  }));
}

// ➊ Reusa el tipo que ya definiste
export interface FeaturedProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  compareAtPrice?: string;
  imageSrc: string;
  altText?: string;
  colorVariants: string[];
  isNew?: boolean;
}

interface NewProductsResponse {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        images: { edges: Array<{ node: { url: string; altText: string } }> };
        options: Array<{ name: string; values: string[] }>;
        color: ShopifyMetafield | null;
        createdAt: string;
        variants: {
          edges: Array<{
            node: {
              selectedOptions: Array<{ name: string; value: string }>;
              price: { amount: string };
              compareAtPrice: { amount: string };
            };
          }>;
        };
      };
    }>;
  };
}

export async function getNewProducts(
  num: number = 12
): Promise<FeaturedProduct[]> {
  const QUERY = /* GraphQL */ `
    query Newest($num: Int!) {
      products(first: $num, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            options(first: 10) {
              name
              values
            }
            color: metafield(
              namespace: "shopify.metaobject_reference"
              key: "color"
            ) {
              reference {
                ... on Metaobject {
                  fields {
                    key
                    value
                  }
                }
              }
            }
            createdAt
            variants(first: 10) {
              edges {
                node {
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                  }
                  compareAtPrice {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { products } = await shopifyFetch<NewProductsResponse>({
    query: QUERY,
    variables: { num },
  });

  return products.edges.map(({ node }) => {
    const img = node.images.edges[0]?.node;
    const v = node.variants.edges[0]?.node;
    const priceNum = Number(v?.price?.amount ?? 0);
    const cmpNum = Number(v?.compareAtPrice?.amount ?? 0); // ----- Extraer variantes de color -----
    const options = node.options;
    let colorVariants: string[] = [];

    const explicitColor = options.find(
      (opt) => opt.name.toLowerCase() === "color"
    );
    if (explicitColor?.values?.length) {
      colorVariants = explicitColor.values;
    } else if (
      options.length === 1 &&
      options[0].values.length > 0 &&
      options[0].values[0].toLowerCase() !== "default title"
    ) {
      colorVariants = options[0].values;
    } else {
      colorVariants = node.variants.edges
        .flatMap((edge) => edge.node.selectedOptions ?? [])
        .filter((sel): sel is { name: string; value: string } => !!sel)
        .filter((sel) => sel.name.toLowerCase() !== "title")
        .map((sel) => sel.value);
    }

    colorVariants = Array.from(
      new Set(
        colorVariants.filter(
          (val) => val && val.toLowerCase() !== "default title"
        )
      )
    );

    const colorFields = node.color?.reference?.fields;
    if (colorFields) {
      const hexField = colorFields.find(
        (f) =>
          f.key === "hex" || (f.key === "value" && f.value?.startsWith("#"))
      );
      const nameField = colorFields.find((f) => f.key === "name");

      if (colorVariants.length === 0) {
        if (hexField?.value) {
          colorVariants = [hexField.value];
        } else if (nameField?.value) {
          colorVariants = [nameField.value];
        }
      } else if (colorVariants.length === 1 && hexField?.value) {
        colorVariants = [hexField.value];
      }
    }

    const createdMs = new Date(node.createdAt).getTime();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;
    const isNew = Date.now() - createdMs < TWO_WEEKS_MS;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      imageSrc: img?.url ?? "/placeholder.png",
      altText: img?.altText ?? node.title,
      price: Math.round(priceNum).toLocaleString("es-AR", {
        useGrouping: true,
      }),
      compareAtPrice: cmpNum > priceNum ? cmpNum.toFixed(0) : undefined,
      colorVariants,
      isNew,
    };
  });
}

// --- Funciones de Catálogo ---
export async function getProducts(
  count: number = 10
): Promise<ShopifyProduct[]> {
  const query = gql`
    query GetProducts($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<GetProductsResponse>({
    query,
    variables: { first: count },
  });
  return response.products.edges.map((edge) => edge.node);
}

// ➍ Tipo de respuesta para los productos en oferta

interface SaleResponse {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        images: { edges: Array<{ node: { url: string; altText: string } }> };
        variants: {
          edges: Array<{
            node: {
              selectedOptions: Array<{ name: string; value: string }>;
              price: { amount: string };
              compareAtPrice: { amount: string };
            };
          }>;
        };
        options: Array<{ name: string; values: string[] }>;
        color: ShopifyMetafield | null;
        createdAt: string;
      };
    }>;
  };
}

export async function getSaleProducts(
  num: number = 12,
  fetchCount: number = 50
): Promise<FeaturedProduct[]> {
  const QUERY = /* GraphQL */ `
    query Sale($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  selectedOptions {
                    name
                    value
                  }
                  price {
                    amount
                  }
                  compareAtPrice {
                    amount
                  }
                }
              }
            }
            options(first: 10) {
              name
              values
            }
            color: metafield(
              namespace: "shopify.metaobject_reference"
              key: "color"
            ) {
              reference {
                ... on Metaobject {
                  fields {
                    key
                    value
                  }
                }
              }
            }
            createdAt
          }
        }
      }
    }
  `;

  // 1) Petición a Shopify
  const { products } = await shopifyFetch<SaleResponse>({
    query: QUERY,
    variables: { first: fetchCount },
  });

  // 2) Mapea y calcula el descuento
  const itemsWithDiscount = products.edges.map(({ node }) => {
    const img = node.images.edges[0]?.node;
    const variant = node.variants.edges[0]?.node;
    const priceNum = Number(variant?.price?.amount ?? 0);
    const cmpNum = Number(variant?.compareAtPrice?.amount ?? 0);
    const discount = cmpNum > priceNum ? (cmpNum - priceNum) / cmpNum : 0;

    // 1) Intento por opcion “Color”
    const colorOption = node.options.find(
      (opt) => opt.name.toLowerCase() === "color"
    );
    let colorVariants =
      Array.isArray(colorOption?.values) && colorOption.values.length
        ? colorOption.values
        : [];

    // 2) Fallback: si no hay en options, miro sólo las selectedOptions “color”
    if (colorVariants.length === 0) {
      colorVariants = node.variants.edges
        .flatMap((edge) => edge.node.selectedOptions ?? [])
        .filter((sel): sel is { name: string; value: string } => !!sel)
        .filter((sel) => sel.name.toLowerCase() === "color")
        .map((sel) => sel.value);
    }

    // 3) Fallback final: si sigue vacío, tomo **todos** los selectedOptions
    if (colorVariants.length === 0) {
      colorVariants = node.variants.edges
        .flatMap((edge) => edge.node.selectedOptions ?? [])
        .filter((sel): sel is { name: string; value: string } => !!sel)
        .map((sel) => sel.value);
    }

    const colorFields = node.color?.reference?.fields;
    if (colorFields) {
      const hexField = colorFields.find(
        (f) =>
          f.key === "hex" || (f.key === "value" && f.value?.startsWith("#"))
      );
      const nameField = colorFields.find((f) => f.key === "name");

      if (colorVariants.length === 0) {
        if (hexField?.value) {
          colorVariants = [hexField.value];
        } else if (nameField?.value) {
          colorVariants = [nameField.value];
        }
      } else if (colorVariants.length === 1 && hexField?.value) {
        colorVariants = [hexField.value];
      }
    }

    const createdMs = new Date(node.createdAt).getTime();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14; // milisegundos en dos semanas
    const isNew = Date.now() - createdMs < TWO_WEEKS_MS;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      imageSrc: img?.url ?? "/placeholder.png",
      altText: img?.altText ?? node.title,
      price: Math.round(priceNum).toLocaleString("es-AR", {
        useGrouping: true,
      }),
      compareAtPrice:
        cmpNum > priceNum
          ? Math.round(cmpNum).toLocaleString("es-AR", {
              useGrouping: true,
            })
          : undefined,
      colorVariants, // ← aquí van los colores
      discount, // para filtrar
      isNew, // para destacar productos nuevos
    };
  });

  console.log(
    "itemsWithDiscount[0].colorVariants:",
    itemsWithDiscount[0]?.colorVariants
  );

  // 3) Filtra sólo ofertas y corta al top N
  const onlyOnSale = itemsWithDiscount.filter((p) => p.discount > 0);
  const topSale = onlyOnSale.slice(0, num);
  return topSale.map(({ discount, ...rest }) => rest);
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const query = gql`
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        tags
        productType
        handle
        descriptionHtml
        createdAt
        options {
          id
          name
          values
        }
        color: metafield(
          namespace: "shopify.metaobject_reference"
          key: "color"
        ) {
          reference {
            ... on Metaobject {
              fields {
                key
                value
              }
            }
          }
        }
        talle: metafield(namespace: "custom", key: "talle") {
          key
          value
        }
        estacion: metafield(namespace: "custom", key: "estacion") {
          key
          value
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<{ product: ShopifyProduct }>({
    query,
    variables: { handle },
  });
  const product = response.product;
  if (!response.product) return null;
  const p = response.product;
  // fecha en ms, o 0 si no existe
  const createdMs = p.createdAt ? Date.parse(p.createdAt) : 0;
  const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;
  // (1) nace hace <30 días  (2) o viene con tag “new”
  const isNewByDate = Boolean(
    createdMs && Date.now() - createdMs < TWO_WEEKS_MS
  );
  const hasNewTag = p.tags?.some((t) => t.toLowerCase() === "new");
  return { ...p, isNew: isNewByDate || hasNewTag };
}

export async function getProductsByHandles(
  handles: string[]
): Promise<ShopifyProduct[]> {
  if (!handles || handles.length === 0) {
    return [];
  }
  const queryFilter = handles
    .map((handle) => `handle:'${handle}'`)
    .join(" OR ");
  const query = gql`
        query GetProductsByHandles($query: String!) {
            products(first: ${handles.length}, query: $query) {
                edges {
                    node {
                        id, title, handle,
                        priceRange { minVariantPrice { amount, currencyCode } },
                        images(first: 1) { edges { node { url, altText } } }
                    }
                }
            }
        }
    `;
  const response = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>({ query, variables: { query: queryFilter } });
  return handles
    .map((handle) => {
      return response.products.edges.find((edge) => edge.node.handle === handle)
        ?.node;
    })
    .filter(Boolean) as ShopifyProduct[];
}

/**
 * Devuelve hasta `limit` productos recomendados por Shopify
 * basados en el producto dado.
 */
export async function getRecommendedProducts(
  productId: string,
  limit: number = 4
): Promise<ShopifyProduct[]> {
  const query = gql`
    query GetRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
        tags
        createdAt
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
        options {
          id
          name
          values
        }
      }
    }
  `;
  // shopifyFetch viene de la configuración inicial de GraphQLClient :contentReference[oaicite:1]{index=1}
  const data = await shopifyFetch<{ productRecommendations: ShopifyProduct[] }>(
    {
      query,
      variables: { productId },
    }
  );
  // la API devuelve todos, aquí cortamos a `limit` en cliente
  return data.productRecommendations.slice(0, limit);
}

// --- Funciones de Navegación desde Colecciones ---

export type NavSection = "categories" | "new" | "collections";

export interface NavItem {
  id: string;
  title: string;
  url: string;
  section: NavSection;
  isNew: boolean;
}

export async function getCollectionsForMenu(): Promise<NavItem[]> {
  const QUERY = /* GraphQL */ `
    query AllCollections($num: Int!) {
      collections(first: $num) {
        edges {
          node {
            id
            title
            handle

            # alias para evitar conflicto
            isNewMetafield: metafield(namespace: "custom", key: "is_new") {
              value
            }
            seasonMetafield: metafield(namespace: "custom", key: "season") {
              value
            }

            products(first: 1, sortKey: CREATED) {
              edges {
                node {
                  createdAt
                  tags
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collections: { edges: any[] };
  }>({ query: QUERY, variables: { num: 250 } });

  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

  return data.collections.edges.map(({ node }) => {
    /* --- metafields leídos mediante alias --- */
    const isNewMeta = node.isNewMetafield?.value === "true";
    const season = node.seasonMetafield?.value?.toLowerCase(); // invierno, verano…

    /* --- heurística adicional por fecha o tag --- */
    const newestProduct = node.products.edges[0]?.node;
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;
    const recentlyAdded =
      newestProduct &&
      Date.now() - Date.parse(newestProduct.createdAt) < TWO_WEEKS_MS;
    const hasNewTag = newestProduct?.tags?.includes("new");

    /* --- decide la sección --- */
    const section: NavSection = season
      ? "collections" // tiene metafield season → pestaña Colecciones
      : isNewMeta || hasNewTag || recentlyAdded
      ? "new" // flag metafield o heurística NEW
      : "categories"; // caso por defecto

    return {
      id: node.id,
      title: node.title.toUpperCase(),
      url: `/collections/${node.handle}`,
      section,
      isNew: section === "new", // badge NEW solo en pestaña New
    };
  });
}

// --- Funciones para Colecciones ---
export async function getCollections(): Promise<ShopifyCollection[]> {
  const query = gql`
    query GetCollections {
      collections(first: 100) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<GetCollectionsResponse>({ query });
  return response.collections.edges.map((edge) => edge.node);
}

export async function getCollectionsBySeason(
  season: string
): Promise<ShopifyCollection[]> {
  const query = gql`
    query GetCollectionsBySeason($query: String!) {
      collections(first: 100, query: $query) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  const seasonQuery = `metafield:custom.season:${season}`;
  const response = await shopifyFetch<GetCollectionsResponse>({
    query,
    variables: { query: seasonQuery },
  });
  return response.collections.edges.map((edge) => edge.node);
}

export async function getCollectionByHandle(
  handle: string
): Promise<ShopifyCollection | null> {
  const query = gql`
    query GetCollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        title
        handle
        products(first: 250) {
          edges {
            node {
              id
              title
              handle
              tags
              createdAt
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              options {
                name
                values
              }
              color: metafield(
                namespace: "shopify.metaobject_reference"
                key: "color"
              ) {
                reference {
                  ... on Metaobject {
                    fields {
                      key
                      value
                    }
                  }
                }
              }
              talle: metafield(namespace: "custom", key: "talle") {
                key
                value
              }
              estacion: metafield(namespace: "custom", key: "estacion") {
                key
                value
              }
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              collections(first: 10) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await shopifyFetch<GetCollectionByHandleResponse>({
      query,
      variables: { handle },
    });
    return response.collection;
  } catch (error) {
    console.error(
      `No se pudo obtener la colección con el handle: ${handle}`,
      error
    );
    return null;
  }
}

// --- Funciones de Carrito ---
export async function createCart(): Promise<ShopifyCart> {
  const query = gql`
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          totalQuantity
        }
      }
    }
  `;
  const response = await shopifyFetch<CreateCartResponse>({
    query,
    variables: { input: {} },
  });
  return response.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity: number
): Promise<ShopifyCart> {
  const query = gql`
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;
  const response = await shopifyFetch<AddToCartResponse>({
    query,
    variables: { cartId, lines: [{ merchandiseId, quantity }] },
  });
  return response.cartLinesAdd.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = gql`
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await shopifyFetch<GetCartResponse>({
      query,
      variables: { cartId },
    });
    return response.cart;
  } catch (e) {
    return null;
  }
}

// --- Funciones para Cuentas de Cliente ---
export async function customerCreate(
  input: any
): Promise<{ customer?: Customer; customerUserErrors: CustomerUserError[] }> {
  const query = gql`
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch<{ customerCreate: any }>({
    query,
    variables: { input },
  });
  return response.customerCreate;
}
export async function customerAccessTokenCreate(input: any): Promise<{
  customerAccessToken?: CustomerAccessToken;
  customerUserErrors: CustomerUserError[];
}> {
  const query = gql`
    mutation customerAccessTokenCreate(
      $input: CustomerAccessTokenCreateInput!
    ) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch<{ customerAccessTokenCreate: any }>({
    query,
    variables: { input },
  });
  return response.customerAccessTokenCreate;
}
export async function customerAccessTokenDelete(
  customerAccessToken: string
): Promise<{ deletedAccessToken?: string; userErrors: CustomerUserError[] }> {
  const query = gql`
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors {
          field
          message
        }
      }
    }
  `;
  const response = await shopifyFetch<{ customerAccessTokenDelete: any }>({
    query,
    variables: { customerAccessToken },
  });
  return response.customerAccessTokenDelete;
}
export async function getCustomer(
  customerAccessToken: string
): Promise<Customer | null> {
  const query = gql`
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
      }
    }
  `;
  try {
    const response = await shopifyFetch<{ customer: Customer | null }>({
      query,
      variables: { customerAccessToken },
    });
    return response.customer;
  } catch (e) {
    return null;
  }
}
export async function getCustomerOrders(
  customerAccessToken: string
): Promise<ShopifyOrder[]> {
  const query = gql`
    query getCustomerOrders($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const response = await shopifyFetch<{
      customer: { orders: { edges: { node: ShopifyOrder }[] } } | null;
    }>({ query, variables: { customerAccessToken } });
    if (!response.customer) {
      return [];
    }
    return response.customer.orders.edges.map((edge) => edge.node);
  } catch (e) {
    return [];
  }
}
