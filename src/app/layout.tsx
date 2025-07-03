// src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // 1. Importa la fuente
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutClient } from "@/components/layout-client";

// 2. Configura la fuente con los pesos que usas
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope", // 3. Asigna una variable CSS
});

export const metadata: Metadata = {
  title: "Munay",
  description: "App de Munay",
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
