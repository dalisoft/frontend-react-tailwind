export const platform = process.env.NETLIFY
  ? "netlify"
  : process.env.VERCEL_ENV
    ? "vercel"
    : process.env.CLOUDFLARE_ENV
      ? "cloudflare"
      : "bun";
