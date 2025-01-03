// @ts-check
import { defineConfig } from "astro/config";

import dotenv from "dotenv";

import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

import icon from "astro-icon";

import vercel from '@astrojs/vercel/serverless';

dotenv.config();

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  // outDir: !process.env.VERCEL ? "../dist" : "dist",
  trailingSlash: "never",
  base: "/",
  build: {
    format: !process.env.VERCEL ? "file" : "directory",
    assetsPrefix: "./", // Ensures that asset paths are relative
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    svelte(),
    icon(),
  ],
  devToolbar: { enabled: false },
  adapter: vercel(),
});
