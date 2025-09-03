/**
 * Types for Facebook catalog items.
 */

/**
 * @typedef {Object} FacebookItem
 * @property {string} retailer_id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [image_url]
 * @property {string} url
 * @property {string} [price]
 * @property {string} [brand]
 * @property {string} availability
 * @property {string} condition
 */

/**
 * Convierte un producto de Shopify al formato esperado por la Catalog API
 * de Facebook.
 *
 * @param {import('./shopify').ShopifyProduct} product
 * @param {string} storeDomain
 * @returns {FacebookItem}
 */
export function shopifyToFacebook(product, storeDomain) {
  const variant = product.variants?.edges?.[0]?.node;
  const priceSet = variant?.priceSet?.shopMoney;
  const price = priceSet
    ? `${priceSet.amount} ${priceSet.currencyCode}`
    : undefined;
  const image = product.images?.edges?.[0]?.node?.url;
  return {
    retailer_id: product.id,
    name: product.title,
    description: product.descriptionHtml,
    image_url: image,
    url: `https://${storeDomain}/products/${product.handle}`,
    price,
    brand: product.productType || null,
    availability: "in stock",
    condition: "new",
  };
}
