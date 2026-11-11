import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is fully dynamic (DB-backed pages keyed by URL), so we don't opt
  // into Cache Components / Partial Prerendering. Leaving them off keeps client
  // components like the reveal page (which reads `useParams()`) simple.
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
