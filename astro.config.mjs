// @ts-check
import { defineConfig } from "astro/config";
import dotenv from "dotenv";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel/serverless";
import path from "path";
dotenv.config();
// https://astro.build/config
export default defineConfig({
  output: "server",
  // outDir: !process.env.VERCEL ? "output" : "dist",
  trailingSlash: "never",
  base: "/",
  // build: {
  //   format: !process.env.VERCEL ? "file" : "directory",
  //   assetsPrefix: "./", // Ensures that asset paths are relative
  // },
  build: {
    format: !process.env.VERCEL ? "file" : "directory",
    assetsPrefix: "./",
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    svelte(),
    icon(),
  ],
  devToolbar: { enabled: false },
  ...(process.env.NODE_ENV === "production" && {
    vite: {
      base: "./",
      ssr: {
        noExternal: true,
      },
    },
  }),
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: "standalone",
      }),
});