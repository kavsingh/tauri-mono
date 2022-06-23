/// <reference types="vitest" />

import path from "path";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import legacyPlugin from "@vitejs/plugin-legacy";
import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checkerPlugin from "vite-plugin-checker";

const checker = checkerPlugin({
  overlay: { initialIsOpen: false },
  typescript: true,
  eslint: {
    lintCommand: 'eslint "./src/**/*.ts"',
    dev: { logLevel: ["error"] },
  },
});

export default defineConfig({
  build: { sourcemap: true },
  plugins: [vanillaExtractPlugin(), checker, reactPlugin(), legacyPlugin()],
  resolve: { alias: { "~": path.resolve(__dirname, "./src") } },
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "jsdom",
    deps: { fallbackCJS: true },
  },
});
