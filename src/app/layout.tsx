// src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // 1. Importa la fuente
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutClient } from "@/components/layout-client";

// -- Helpers --
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

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
        url: new URL("/munay-wordmark.png", appUrl).toString(),
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
      <body className="bg-background-primary-default">
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
