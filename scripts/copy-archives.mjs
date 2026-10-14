import { cp, rm, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Folds the archived builds into the current site's, so the whole thing
 * deploys as one static bundle and /legacy/ and /prototype/ just work.
 *
 * Kept as a copy step rather than pointing Vite's --outDir straight at
 * ../dist/<name>: the root build runs first and empties dist/, so writing
 * there directly would race with it.
 */

const here = dirname(fileURLToPath(import.meta.url));

const ARCHIVES = [
  { name: "legacy", from: resolve(here, "../legacy/dist") },
  { name: "prototype", from: resolve(here, "../prototype/dist") },
];

for (const { name, from } of ARCHIVES) {
  try {
    await access(from);
  } catch {
    console.error(`[archives] ${from} not found - run "npm run build:${name}" first.`);
    process.exit(1);
  }
  const to = resolve(here, `../dist/${name}`);
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`[archives] ${name} -> dist/${name}`);
}
