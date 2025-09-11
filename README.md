This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="<your-shop-domain>.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="<your-storefront-token>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"
SHOPIFY_ADMIN_ACCESS_TOKEN="<your-admin-token>"
SHOPIFY_STORE_DOMAIN="<your-shop-domain>.myshopify.com"
# Optional, defaults to "2025-04" if unset
SHOPIFY_API_VERSION="2025-04"
FACEBOOK_CATALOG_ID="<your-facebook-catalog-id>"
FACEBOOK_ACCESS_TOKEN="<your-facebook-access-token>"
WHATSAPP_TOKEN="<your-whatsapp-token>"
WHATSAPP_PHONE_ID="<your-whatsapp-phone-id>"
# Optional if using Twilio or a custom sender
WHATSAPP_FROM="<your-whatsapp-from-number>"
```

## Installation

Install the project dependencies after cloning the repository:

```bash
npm install
```

## Getting Started

First, run the development server.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Checkout Flow

The application now bypasses the old `/checkout` page. Clicking **Buy Now** or continuing from the cart sends the shopper straight to the Shopify checkout using the `checkoutUrl` provided by the API. If you need an intermediate step for alternative payment methods, you may reintroduce a custom page and update the navigation accordingly.

## Sync Facebook Catalog

1. Configure `FACEBOOK_CATALOG_ID` y `FACEBOOK_ACCESS_TOKEN` en tu archivo `.env`.
2. Asegúrate de tener `SHOPIFY_ADMIN_ACCESS_TOKEN` y `SHOPIFY_STORE_DOMAIN` definidos.
3. Ejecuta el script con:

```bash
npm run sync:catalog
```

## WhatsApp Order Notifications

The checkout pages trigger a request to `/api/send-whatsapp` when a pending order is created.
Configure the WhatsApp Business Cloud API or Twilio to send the message automatically.

1. Obtain a token and phone number ID from the [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/).
2. In Business Manager, register a template named `order_confirmation` with body:
   `Hola {{1}}, recibimos tu pedido {{2}} por {{3}}.`
3. Populate the variables in `.env.local`:

   ```
   WHATSAPP_TOKEN="<your-whatsapp-token>"
   WHATSAPP_PHONE_ID="<your-whatsapp-phone-id>"
   # Optional if using Twilio or a custom sender
   WHATSAPP_FROM="<your-whatsapp-from-number>"
   ```

4. Test the endpoint locally:

   ```bash
   curl -X POST http://localhost:3000/api/send-whatsapp \
     -H "Content-Type: application/json" \
     -d '{"phone":"<destination>","orderId":"123","paymentMethod":"efectivo"}'
   ```

If the API call fails the checkout pages still expose a manual WhatsApp button as a fallback.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
