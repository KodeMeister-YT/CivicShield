import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permanently disable the Next.js dev-mode route indicator (the small
  // corner badge shown during `next dev`). It never renders in production
  // builds/deployments regardless, but we turn it off explicitly so it
  // never appears during local development either.
  devIndicators: false,
};

export default nextConfig;
