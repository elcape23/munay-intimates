// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/nav-bar";
import { SideMenu } from "@/components/common/side-menu"; // Importamos el SideMenu

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MUNAY | Tienda Online",
  description: "Descubre nuestra colección de lencería.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Añadimos el SideMenu aquí para que esté disponible en toda la app */}
        <SideMenu />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        {/* Aquí podríamos añadir un Footer en el futuro */}
      </body>
    </html>
  );
}
