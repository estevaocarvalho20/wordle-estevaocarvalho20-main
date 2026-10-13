import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  server: {
    port: 4174,
    host: "127.0.0.1",
    strictPort: true,
  },
  preview: {
    port: 4174,
    host: "127.0.0.1",
    strictPort: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
