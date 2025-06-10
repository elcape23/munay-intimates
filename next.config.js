/** @type {import('next').NextConfig} */
const nextConfig = {
  // Añadimos esta configuración para las imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: "",
        pathname: "/s/files/**",
      },
    ],
  },
};

module.exports = nextConfig;

// Si tu archivo es next.config.mjs (módulo ES), la sintaxis sería:
/*
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/s/files/**',
      },
    ],
  },
};

export default nextConfig;
*/
