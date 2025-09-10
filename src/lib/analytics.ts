// src/lib/analytics.ts
export type GAItem = {
  item_name: string;
  item_id: string;
  price: number;
  quantity: number;
};

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function pushEvent(event: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: payload });
}

export function trackViewItem(item: GAItem) {
  pushEvent("view_item", { items: [item] });
}

export function trackAddToCart(item: GAItem) {
  pushEvent("add_to_cart", { items: [item] });
}

export function trackBeginCheckout(items: GAItem[]) {
  pushEvent("begin_checkout", { items });
}

export function trackPurchase(
  transaction_id: string,
  value: number,
  currency: string,
  items: GAItem[]
) {
  pushEvent("purchase", { transaction_id, value, currency, items });
}
