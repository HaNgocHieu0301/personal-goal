import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig as NextConfig;
