/// <reference types="vitest" />

import path from "path";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import legacyPlugin from "@vitejs/plugin-legacy";
import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isTest = process.env.NODE_ENV === "test";

export default defineConfig({
  build: { sourcemap: !isTest },
  plugins: [legacyPlugin(), reactPlugin(), vanillaExtractPlugin()],
  resolve: { alias: { "~": path.resolve(__dirname, "./src") } },
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "jsdom",
  },
});
