import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      // Add any custom aliases if needed
    },
  },
};

export default nextConfig;
