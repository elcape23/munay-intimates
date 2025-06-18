// next.config.ts
import type { NextConfig } from "next";
import type { RuleSetRule } from "webpack"; // typings opcionales

const nextConfig: NextConfig = {
  webpack(config) {
    // 1️⃣ Localiza la regla que maneja imágenes (incl. .svg)
    const fileLoaderRule = config.module?.rules.find(
      //      👇 le asignamos tipo explícito → adiós “implicit any”
      (rule: unknown): rule is RuleSetRule =>
        typeof rule === "object" &&
        rule !== null &&
        // @ts-expect-error -- test puede no existir en todas las variantes
        rule.test instanceof RegExp &&
        // @ts-expect-error -- test puede no existir en todas las variantes
        rule.test.test?.(".svg")
    );

    // 2️⃣ Excluye .svg para que no caigan en esa regla
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;

    // 3️⃣ Inserta SVGR al principio (para que se aplique antes)
    config.module?.rules.unshift({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
