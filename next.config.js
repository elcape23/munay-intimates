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
  webpack(config) {
    const fileLoaderRule = config.module?.rules.find(
      (rule) =>
        typeof rule === "object" &&
        rule !== null &&
        rule.test instanceof RegExp &&
        rule.test.test?.(".svg")
    );

    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;

    config.module?.rules.unshift({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
