import type { defineConfig } from "nitro";
import type { platform } from "./config";

export const presets: Record<
  typeof platform,
  Parameters<typeof defineConfig>[0]
> = {
  netlify: {
    compatibilityDate: "2024-05-07",
    preset: "netlify",
  },
  vercel: {
    compatibilityDate: "2025-07-15",
    preset: "vercel",
  },
  cloudflare: {
    compatibilityDate: "2024-09-19",
    preset: "cloudflare-module",
    cloudflare: { deployConfig: true, nodeCompat: true },
  },
  bun: {
    preset: "bun",
  },
};
