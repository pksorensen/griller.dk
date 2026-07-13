import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker/Coolify image.
  output: "standalone",
  // The hero photo is already sized for the layout; no need for the optimizer
  // pipeline (keeps the standalone image lean, no sharp dependency).
  images: { unoptimized: true },
};

export default nextConfig;
