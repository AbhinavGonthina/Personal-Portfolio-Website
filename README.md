# abhinavgonthina.dev

My portfolio. It is a walk through a 3D town, and it is also an
ordinary page you can read.

**[abhinavgonthina.dev](https://abhinavgonthina.dev)**

## Two readings of the same site

The site has one set of content and two ways through it.

**The town** is the default on a wide screen. Scrolling walks a camera
down a street rather than scrolling a page: each section of the site is
a stop on the walk, and where the scroll sits between two section tops
is where the camera sits between two stops. The places you arrive at
are real objects — a hoarding you read, a skyline whose towers are the
jobs, a desk with a monitor you can open projects on, a row of
mailboxes you can post to.

**The written read** is the same material as a page. Hit _Simplify_ in
the bar, or arrive on anything narrower than 1024px, and the canvas is
never mounted at all — the town is removed, not dimmed.

The written read has three levels, because "simpler" turned out to mean
three different things:

| Level  | What it is                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------- |
| `rich` | the default. Colour, movement, sections laid out to be looked at                                      |
| `bare` | one column, no motion, nothing but the words                                                          |
| `raw`  | every stylesheet switched off. The markup, the way a browser drew documents before anybody styled one |

`raw` is reachable only by asking twice.

## Built with

React 19 and Vite 7. Tailwind v4, configured in CSS rather than a
config file. [Motion](https://motion.dev) for everything that moves on
the page, and [React Three Fiber](https://r3f.docs.pmnd.rs) over
three.js for the town.

The components that are not mine are vendored rather than installed —
copied out of the registries of
[Aceternity](https://ui.aceternity.com),
[Magic UI](https://magicui.design) and
[React Bits](https://reactbits.dev), stripped of TypeScript, and
annotated with what was changed and why. They live in
`src/components/rich/`.

three.js never reaches anyone who does not see the town: it is behind a
`lazy()` boundary, which is most of the difference between a 1.3MB
entry bundle and a 128KB one.

## Running it

```sh
npm install
npm run dev
```

| Script            | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | the dev server                                        |
| `npm run build`   | the site, plus both archives, folded into one `dist/` |
| `npm run preview` | serve that build                                      |
| `npm run lint`    | eslint                                                |
| `npm run deploy`  | build, then push `dist/` to GitHub Pages              |

## Poking at it

A handful of query parameters exist so that states which are normally
hard to reach can be linked to and photographed.

| Parameter                 | What it does                                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `?plain=1` / `?plain=0`   | force the written read, or force the town on a narrow window                                                                                                                 |
| `?read=rich\|bare\|raw`   | pick a reading level                                                                                                                                                         |
| `?theme=dark\|light`      | pick a palette                                                                                                                                                               |
| `?gl=1` / `?gl=0`         | insist on the WebGL backgrounds, or refuse them. `?gl=1` is how they get rendered in a headless browser with no GPU, where the frame-rate watchdog would otherwise pull them |
| `?arrive=0` / `?arrive=1` | skip the arrival sequence, or replay it after it has already run                                                                                                             |
| `?arrive=1&at=5`          | hold the arrival at five seconds instead of playing it, which is the only practical way to look hard at one beat of an eight-second shot                                     |

## Two older versions, still up

Kept buildable and online, and linked only from one line in the
footer.

- **[/legacy](https://abhinavgonthina.dev/legacy/)** — the first
  version, Material UI and a terminal-style project explorer.
- **[/prototype](https://abhinavgonthina.dev/prototype/)** — an
  unfinished botanical direction: line-art brick, falling leaves,
  cream and camel. Abandoned part-way in favour of this one, and kept
  because a screenshot in a commit message is not the same as being
  able to click the thing.

Each is its own Vite app under `legacy/` and `prototype/`. They are
built separately and copied into `dist/` by
`scripts/copy-archives.mjs`, so the whole thing deploys as one static
bundle. In development, `vite.config.js` serves each one's `dist/` at
its own path once it has been built at least once.

## Layout

```
src/
  sections/      one file per section of the page
  components/    the page's own furniture
    rich/        backdrops and effects, mostly vendored
  scenes/        the town: the R3F tree, the arrival, the street
  lib/           stores, geometry, and the canvas painters the town is dressed with
  data/          the actual content — roles, projects, skills, profile
public/          images, video, favicons, the CNAME
scripts/         build helpers and the badge generator
legacy/          archived build, served at /legacy
prototype/       archived build, served at /prototype
```

Most of the interesting decisions are written down next to the code
that makes them, usually with the thing that was tried first and why it
did not work.
