import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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

/**
 * Preload the two font files the page actually uses.
 *
 * Both are pulled in by `@fontsource-variable/...` imports in the
 * stylesheet, which means the browser cannot know they exist until
 * it has downloaded and parsed a 50KB sheet - and the text it needs
 * them for is the first thing on the page. Preloading moves the
 * request to the top of the document, so the fonts travel alongside
 * the CSS rather than behind it.
 *
 * Only `latin`, and only `normal`. Fontsource ships five subsets per
 * family - latin, latin-ext, cyrillic, cyrillic-ext, vietnamese -
 * each behind its own `unicode-range`, so a browser rendering
 * English never asks for the other four. Preloading one it will not
 * use is worse than not preloading at all: the file is fetched,
 * occupies the connection, and is thrown away.
 *
 * The names are hashed at build time, which is why this is a plugin
 * and not two lines of HTML.
 */
function preloadFonts() {
  return {
    name: "preload-fonts",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      const want = /geist(-mono)?-latin-wght-normal-[^/]+\.woff2$/;
      return Object.keys(ctx.bundle ?? {})
        .filter((f) => want.test(f))
        .map((f) => ({
          tag: "link",
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/woff2",
            href: "/" + f,
            crossorigin: "",
          },
          injectTo: "head-prepend",
        }));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serveArchives(), preloadFonts()],
  base: "/",
  build: {
    // three.js is 729KB of the town chunk on its own and there is
    // no splitting that away from a 3D scene. The warning has
    // nothing left to tell us.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        /**
         * React and Motion get their own chunks.
         *
         * Not to make the first visit smaller - it is the same
         * bytes either way, fetched in parallel - but to make
         * every visit after a deploy smaller. These two are 290
         * of the entry's 457 kilobytes and they change only when
         * a dependency is upgraded, while the other 167 change
         * every time a word on the page does. Left in one chunk,
         * fixing a typo re-downloads React.
         *
         * Everything else is left to Rollup. Hand-splitting
         * further is how you end up loading a chunk's chunk.
         */
        // Forward slashes only: Rollup normalises module ids, so a
        // path on Windows arrives here looking like a path on Linux.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id))
            return "react";
          if (
            /\/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(
              id,
            )
          )
            return "motion";
        },
      },
    },
  },
});
