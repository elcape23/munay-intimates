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
  handle: string;
  tags: string[];
  descriptionHtml?: string;
  priceRange: { minVariantPrice: ShopifyPrice };
  images: { edges: { node: ShopifyImage }[] };
  options: ShopifyProductOption[];
  variants?: { edges: { node: ShopifyProductVariant }[] };
  color?: ShopifyMetafield | null;
  talle?: ShopifyMetafield | null;
  estacion?: ShopifyMetafield | null;
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
    const data = await shopifyClient.request<T>(query, variables);
    return data;
  } catch (error: any) {
    console.error(
      "Error en la petición a Shopify API:",
      error.response?.errors || error.message
    );
    throw new Error("No se pudo obtener la información de Shopify.");
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
          metafield(namespace: "custom", key: "section") {
            value
          }
          metafield(namespace: "custom", key: "is_new") {
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
    url: item.url.replace(/^https?:\/\/[^/]+/, ""),
    section: (item.metafield?.value as any) ?? "categories",
    isNew: item.metafield_1?.value === "true",
  }));
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

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const query = gql`
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        descriptionHtml
        options {
          id
          name
          values
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
  return response.product;
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

  console.log("🔎 collections raw →", data.collections); // 👈

  const now = Date.now();
  const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

  return data.collections.edges.map(({ node }) => {
    /* --- metafields leídos mediante alias --- */
    const isNewMeta = node.isNewMetafield?.value === "true";
    const season = node.seasonMetafield?.value?.toLowerCase(); // invierno, verano…

    /* --- heurística adicional por fecha o tag --- */
    const newestProduct = node.products.edges[0]?.node;
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    const recentlyAdded =
      newestProduct &&
      Date.now() - Date.parse(newestProduct.createdAt) < THIRTY_DAYS;
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
      url: `/collection/${node.handle}`,
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
