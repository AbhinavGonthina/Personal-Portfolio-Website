import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * The botanical redesign, frozen. Abandoned part-way in favour of a dark,
 * technical direction, and kept so the work is still viewable rather than
 * only reachable through git history.
 *
 * It carries its own package.json and node_modules because it is pinned to a
 * stack the main app no longer uses - MUI and Emotion. Sharing the root's
 * dependencies looked tidier right up until the root dropped MUI, at which
 * point this stopped building.
 */
export default defineConfig({
  plugins: [react()],
  base: "/prototype/",
});
