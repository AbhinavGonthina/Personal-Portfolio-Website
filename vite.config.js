import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sirv from "sirv";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Archived builds, each served at its own path in dev the same way the
// production bundle serves them.
const ARCHIVES = [
  { route: "/legacy", dir: resolve(here, "legacy/dist") },
  { route: "/prototype", dir: resolve(here, "prototype/dist") },
];

/**
 * Each archive is its own Vite app. In a production build they are built
 * separately and folded into dist/<name> (see scripts/copy-archives.mjs),
 * but the dev server knows nothing about them - so the links to them would
 * 404 locally. This serves each one's dist during dev once it has been built
 * at least once, which is enough to click through and check.
 */
function serveArchives() {
  return {
    name: "serve-archives",
    apply: "serve",
    configureServer(server) {
      for (const { route, dir } of ARCHIVES) {
        if (!existsSync(dir)) {
          server.config.logger.warn(
            `[archives] ${dir} not found - ${route} will 404 in dev.`,
          );
          continue;
        }
        server.middlewares.use(route, sirv(dir, { dev: true, single: true }));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveArchives()],
  base: "/",
});
