import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@moduvita/core", "@moduvita/notes", "@moduvita/journal"],
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // Pages recebe só a página pública pré-renderizada; rotas de Auth continuam no servidor.
  ...(process.env.PAGES_PREVIEW === "1" ? {
    basePath: "/moduvita-platform",
    assetPrefix: "/moduvita-platform",
  } : {}),
};

export default nextConfig;
