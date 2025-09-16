import { ShopifyProduct } from "./shopify";

export function extractColorVariants(product: ShopifyProduct): string[] {
  const options = product.options || [];
  let colorVariants: string[] = [];

  const explicitColor = options.find(
    (opt) => opt.name.toLowerCase() === "color"
  );
  if (explicitColor?.values?.length) {
    colorVariants = explicitColor.values;
  } else if (product.variants) {
    colorVariants = product.variants.edges
      .flatMap((edge) => edge.node.selectedOptions ?? [])
      .filter((sel): sel is { name: string; value: string } => !!sel)
      .filter((sel) => sel.name.toLowerCase() === "color")
      .map((sel) => sel.value);
  }

  colorVariants = Array.from(
    new Set(
      colorVariants.filter(
        (val) => val && val.toLowerCase() !== "default title"
      )
    )
  );

  const colorFields = product.color?.reference?.fields;
  if (colorFields) {
    const hexField = colorFields.find(
      (f) => f.key === "hex" || (f.key === "value" && f.value?.startsWith("#"))
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

  return colorVariants;
}

export function sortProductsByAvailability(
  products: ShopifyProduct[]
): ShopifyProduct[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aAvailable = Boolean(a.product.availableForSale);
      const bAvailable = Boolean(b.product.availableForSale);

      if (aAvailable === bAvailable) {
        return a.index - b.index;
      }

      return aAvailable ? -1 : 1;
    })
    .map(({ product }) => product);
}
