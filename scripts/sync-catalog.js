import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { shopifyToFacebook } from "../src/lib/facebook.js";

const storeDomain = (
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  ""
).replace(/^https?:\/\//, "");
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-04";
const fbToken = process.env.FACEBOOK_ACCESS_TOKEN;
const catalogId = process.env.FACEBOOK_CATALOG_ID;

if (!storeDomain || !adminToken) {
  console.error("Shopify credentials are missing");
  process.exit(1);
}
if (!fbToken || !catalogId) {
  console.error("Facebook credentials are missing");
  process.exit(1);
}

async function fetchProducts() {
  const query = `
  query {
      products(first: 100) {
        edges {
          node {
            id
            handle
            title
            productType
            tags
            descriptionHtml
            images(first: 1) { edges { node { url } } }
            variants(first: 1) {
              edges {
                node {
                  price { amount currencyCode }
                }
              }
            }
            genero: metafield(namespace: "custom", key: "genero") { value }
            material: metafield(namespace: "custom", key: "material") { value }
            talle: metafield(namespace: "custom", key: "talle") { value }
            categoria: metafield(namespace: "custom", key: "categoria") { value }
          }
        }
      }
    }
  `;

  const endpoint = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({ query }),
  });

  let json;
  try {
    json = await res.json();
  } catch (err) {
    console.error("Failed to parse Shopify response", err);
    throw err;
  }

  if (!res.ok) {
    console.error("Shopify API request failed", json);
    throw new Error(`HTTP ${res.status}`);
  }

  if (!json?.data?.products) {
    console.error("Unexpected Shopify response", json);
    throw new Error("Invalid Shopify data");
  }
  return json.data.products.edges.map((e) => e.node);
}

async function sendToFacebook(item) {
  const url = `https://graph.facebook.com/v19.0/${catalogId}/items?access_token=${fbToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Failed", item.retailer_id, json);
  } else {
    console.log("Uploaded", item.retailer_id);
  }
}

(async function main() {
  const products = await fetchProducts();
  for (const p of products) {
    const item = shopifyToFacebook(p, storeDomain);
    await sendToFacebook(item);
  }
})();
