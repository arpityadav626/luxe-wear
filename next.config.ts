import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "luxe-wear";
const basePath = isGitHubPages
  ? (process.env.NEXT_PUBLIC_BASE_PATH ?? `/${repoName}`)
  : "";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isGitHubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
