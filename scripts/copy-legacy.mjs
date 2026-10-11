import { cp, rm, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Folds the archived site's build into the current site's, so the whole thing
 * deploys as one static bundle and `abhinavgonthina.me/legacy/` just works.
 *
 * Kept as a copy step rather than pointing Vite's --outDir straight at
 * ../dist/legacy: the root build runs first and empties dist/, so writing the
 * legacy output there directly would race with it.
 */

const here = dirname(fileURLToPath(import.meta.url));
const from = resolve(here, "../legacy/dist");
const to = resolve(here, "../dist/legacy");

try {
  await access(from);
} catch {
  console.error(
    `[copy-legacy] ${from} not found — run "npm run build:legacy" first.`,
  );
  process.exit(1);
}

await rm(to, { recursive: true, force: true });
await cp(from, to, { recursive: true });
console.log(`[copy-legacy] archived site -> dist/legacy`);
