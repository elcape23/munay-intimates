// src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // 1. Importa la fuente
import "./globals.css";
import { Navbar } from "@/components/common/nav-bar";
import { SideMenu } from "@/components/common/side-menu";

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
      <body>
        <Navbar />
        <SideMenu /> {/* El SideMenu se superpone y se controla solo */}
        <main>{children}</main>
      </body>
    </html>
  );
}
