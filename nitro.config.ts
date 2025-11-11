import { defineConfig } from "nitro";

const generatePreset = <TConfig extends Parameters<typeof defineConfig>[0]>(
  config: TConfig,
): TConfig =>
  process.env.NETLIFY
    ? // Netlify preset
      {
        compatibilityDate: "2024-05-07",
        preset: "netlify",
        ...config,
      }
    : // Vercel preset
      process.env.VERCEL_ENV
      ? { compatibilityDate: "2025-07-15", preset: "vercel", ...config }
      : process.env.CLOUDFLARE_ENV
        ? // Cloudflare preset
          {
            compatibilityDate: "2024-09-19",
            preset: "cloudflare-module",
            cloudflare: { deployConfig: true, nodeCompat: true },
            ...config,
          }
        : // Default: Bun preset
          { preset: "bun", ...config };

export default defineConfig(generatePreset({}));
