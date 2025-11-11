import { defineConfig } from "nitro";

const generatePreset = (): Parameters<typeof defineConfig>[0] =>
  process.env.NETLIFY
    ? // Netlify preset
      {
        compatibilityDate: "2024-05-07",
        preset: "netlify",
        cloudflare: { deployConfig: true, nodeCompat: true },
      }
    : // Vercel preset
      process.env.VERCEL_ENV
      ? { compatibilityDate: "2025-07-15", preset: "vercel" }
      : process.env.CLOUDFLARE_ENV
        ? // Cloudflare preset
          { compatibilityDate: "2024-09-19", preset: "cloudflare-module" }
        : // Default: GitHub Pages preset
          { preset: "github-pages" };

export default defineConfig(generatePreset());
