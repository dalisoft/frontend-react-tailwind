import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

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
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          outputPath: "index.html",

          enabled: true,

          // Enable if you need pages to be at `/page/index.html` instead of `/page.html`
          autoSubfolderIndex: true,

          // Whether to extract links from the HTML and prerender them also
          crawlLinks: true,

          // Number of times to retry a failed prerender job
          retryCount: 2,

          // Delay between retries in milliseconds
          retryDelay: 1000,

          // Callback when page is successfully rendered
          onSuccess: ({ page }) => {
            console.log(`Rendered ${page.path}!`);
          },
        },
      },
      prerender: {
        // Enable prerendering
      },
      sitemap: {
        enabled: true,
        host: process.env.DOMAIN_URL,
      },
    }),
    nitro(),
    viteReact(),
  ],
});

export default config;
