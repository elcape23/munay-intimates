// next.config.ts

// Paso 1: Importamos el "tipo" de configuración desde Next.js.
// Esto nos ayuda con el autocompletado y a evitar errores.
import type { NextConfig } from "next";

// Paso 2: Creamos nuestro objeto de configuración.
// Le decimos a TypeScript que este objeto debe seguir las reglas de 'NextConfig'.
const nextConfig: NextConfig = {
  // Paso 3: Definimos una función especial llamada 'webpack'.
  // Next.js nos permite usar esta función para modificar su configuración interna de Webpack.
  webpack(config) {
    // Paso 4: Añadimos una nueva regla a la configuración de Webpack.
    // Es como decirle: "Oye Webpack, cuando veas cierto tipo de archivo, haz algo especial".
    config.module.rules.push({
      // La regla se aplica a cualquier archivo que termine en ".svg" (sin importar mayúsculas o minúsculas).
      test: /\.svg$/i,

      // IMPORTANTE: Esta regla solo se aplica si el archivo .svg fue importado desde un archivo de React (.js, .jsx, .ts, .tsx).
      // Esto evita que la regla afecte a los SVGs usados en otros lugares, como en archivos CSS.
      issuer: /\.[jt]sx?$/,

      // Cuando se cumplan las condiciones anteriores, usa la herramienta '@svgr/webpack'.
      // Esta herramienta es la que convierte el código del archivo SVG en un componente de React.
      use: ["@svgr/webpack"],
    });

    // Paso 5: Devolvemos la configuración ya modificada para que Next.js la pueda usar.
    return config;
  },
};

// Paso 6: Exportamos nuestra configuración completa para que Next.js la pueda leer al arrancar.
export default nextConfig;
