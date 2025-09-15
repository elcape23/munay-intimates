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
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MD2MVH2D');
          `}
        </Script>
        {/* End Google Tag Manager */}
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/tb3zbk3n7q";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script");
            `,
          }}
        />
      </head>
      <body className="bg-background-primary-default">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MD2MVH2D"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
