import { cloudflare } from "@cloudflare/vite-plugin";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const platformTarget = () =>
  [
    process.env.NETLIFY && netlify(),
    // TODO: `nitro` or by default ?
    process.env.VERCEL_ENV && false,
    process.env.CLOUDFLARE_ENV &&
      cloudflare({
        viteEnvironment: { name: "client" as "client" | "ssr" },
      }),
  ].find((valid) => valid) as Plugin<never>[];

const config = defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  preview: {
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [{ name: "vendor", test: /\/react(?:-dom)?/ }],
        },
      },
    },
  },
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    platformTarget(),
    nitro({ preset: "bun" }),
    viteReact(),
  ],
});

export default config;
