import { defineConfig } from "rolldown-vite";

export default defineConfig({
	server: { port: 4321 },
	build: { minify: true },
});
