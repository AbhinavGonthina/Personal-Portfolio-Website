import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sirv from "sirv";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const legacyDist = resolve(here, "legacy/dist");

/**
 * The archived site is a separate Vite app. In a production build it is built
 * on its own and folded into dist/legacy (see scripts/copy-legacy.mjs), but
 * the dev server knows nothing about it — so "View the old site" would 404
 * locally. This serves legacy/dist at /legacy during dev once it has been
 * built at least once, which is enough to click through and check the link.
 */
function serveLegacy() {
  return {
    name: "serve-legacy",
    apply: "serve",
    configureServer(server) {
      if (!existsSync(legacyDist)) {
        server.config.logger.warn(
          '[legacy] legacy/dist not found — /legacy will 404 in dev. Run "npm run build:legacy".',
        );
        return;
      }
      const serve = sirv(legacyDist, { dev: true, single: true });
      server.middlewares.use("/legacy", serve);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveLegacy()],
  base: "/",
});
