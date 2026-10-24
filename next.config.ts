import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workers, jobs, and photos change on every click, so pages stay request-time.
  cacheComponents: false,
  // Native SQLite module. Do not bundle it into the server code.
  serverExternalPackages: ["better-sqlite3"],
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
