This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:'

````
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="<your-shop-domain>.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="<your-storefront-token>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"
```

## Installation

Install the project dependencies after cloning the repository:

```bash
npm install
````

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
