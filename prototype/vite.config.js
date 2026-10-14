import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The botanical redesign, frozen. It was abandoned part-way in favour of a
 * dark, modern direction, and is kept so the work is still viewable rather
 * than only reachable through git history.
 *
 * No package.json of its own - it uses the same dependency set as the root
 * app, which Vite resolves by walking up to the root node_modules.
 */
export default defineConfig({
  root: here,
  plugins: [react()],
  base: "/prototype/",
  build: { outDir: resolve(here, "dist"), emptyOutDir: true },
});
