# Legacy portfolio (v1)

This is the original version of abhinavgonthina.me, kept here so the code stays
browsable after the 2026 redesign. It is **not** built, linted, or deployed as
part of the live site — the root project ignores this directory entirely.

The live site was rebuilt from scratch in September 2026. The last commit where
this was the deployed site is `b348c24`.

## What it looked like

A dark, single-page site built around a WebGL particle field, glassmorphic
floating cards, and a fake file-explorer for the projects section (projects were
browsed as `.exe` files inside folders).

## Running it

It has its own `package.json` and its own `public/` directory, so it runs
standalone:

```bash
cd legacy
npm install
npm run dev
```

## Why it was replaced

- Layout was pinned to viewport units (`fontSize: "7vh"`, `top: "40vh"`), so
  mobile was handled by hiding elements rather than adapting them.
- Two styling systems (MUI `sx` + Tailwind) and four animation libraries
  (`motion`, `framer-motion`, `gsap`, `react-awesome-reveal`) shipped together.
- `public/` was 76 MB, including a single 35 MB intro video.
- ~6,000 lines across seven section components, most of it inline style objects.

## Stack

React 19 · Vite · MUI · Tailwind v4 · Framer Motion · GSAP · OGL · react-bits
