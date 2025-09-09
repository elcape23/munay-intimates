// src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // 1. Importa la fuente
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutClient } from "@/components/layout-client";
import Script from "next/script";

// -- Helpers --
// Next.js bots like WhatsApp require absolute URLs for Open Graph tags.
// Fall back to Vercel's URL if NEXT_PUBLIC_APP_URL is not provided.
const rawAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

// Ensure the URL includes the protocol so new URL() doesn't throw.
const appUrl = rawAppUrl.startsWith("http")
  ? rawAppUrl
  : `https://${rawAppUrl}`;
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Munay Intimates",
  description: "Tienda de lencería",
  openGraph: {
    title: "Munay Intimates",
    description: "Tienda de lencería",
    url: appUrl,
    images: [
      {
        url: new URL(
          "https://www.munayintimates.com.ar/munay-wordmark.png",
          appUrl
        ).toString(),
        width: 1200,
        height: 630,
        alt: "Munay Intimates",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={manrope.className}>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-12CV28TV48"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-12CV28TV48');
          `}
        </Script>
      </head>
      <body className="bg-background-primary-default">
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
