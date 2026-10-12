import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The archived site is published as a sub-app of the current one, at
  // abhinavgonthina.dev/legacy/. Vite rewrites asset URLs against this.
  base: "/legacy/",
});
