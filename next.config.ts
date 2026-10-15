// next.config.ts — sviluppo locale normale; per la versione pubblica (NEXT_PUBLIC_READ_ONLY=1) build statica per GitHub Pages.
import type { NextConfig } from "next";

const READ_ONLY = process.env.NEXT_PUBLIC_READ_ONLY === "1";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(READ_ONLY
    ? {
        output: "export",
        basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
