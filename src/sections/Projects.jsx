import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { projects } from "../data/projects";

/** One click of an arrow, and the width the cards are cut to. */
const STEP =
  "flex size-9 items-center justify-center rounded-full border border-ink-700 text-fg-muted transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-fg disabled:opacity-30 disabled:hover:border-ink-700 disabled:hover:bg-transparent disabled:hover:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * The monitor on the desk. The list is scrolled on the monitor itself
 * rather than by the page, so this is one ordinary section - it used
 * to be two viewports tall with a second camera stop at the bottom,
 * and all that bought was a viewport of scrolling where nothing
 * appeared to happen.
 *
 * The plain read shows the pictures. Eleven text cards is a wall of
 * grey the eye slides off; the same eleven with a screenshot each is
 * a page you can skim by sight. Every project has an image or a video
 * poster, so none of them is a hole.
 *
 * The first is given the full width and its longer description, for
 * the same reason it is the featured card on the monitor.
 */

const LINK =
  "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors";

function Shot({ p }) {
  const src = p.image ?? p.poster;
  if (!src) return null;
  // Two of these have a wordmark where the others have a screenshot.
  // Cropped to fill like a screenshot, a wide logo comes out as four
  // letters of itself - "Rainfo" - so a logo is fitted inside the
  // frame instead, with room around it.
  const logo = src.includes("/logos/");
  return (
    <div className="relative flex aspect-[16/10] shrink-0 items-center justify-center overflow-hidden border-b border-ink-800 bg-ink-900">
      {/* Scaled by height, not width.
          Filling the width crops whatever does not fit underneath,
          which on a phone screenshot is most of the screenshot -
          you got the status bar and the top of a header. By height
          the whole screen is there; a tall one sits as a narrow
          panel, a wide one runs off the sides, and both show the
          part worth seeing. */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`transition-transform duration-500 group-hover:scale-[1.04] ${
          // A wordmark is fitted whole inside the frame. Scaled by
          // height like a screenshot it overflows the sides and
          // loses the end of its own name.
          logo
            ? "size-full object-contain p-8"
            : "h-full w-auto max-w-none object-cover"
        }`}
      />
      {!logo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent"
        />
      )}
    </div>
  );
}

function Card({ p, lead }) {
  return (
    <article
      // A slide, so every card is cut to the same size: the rail
      // only reads as a gallery if the cards line up, and a card
      // sized to its own blurb puts the links at a different height
      // on every one of them.
      className={`group flex h-[460px] w-[332px] shrink-0 flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40 transition-colors hover:border-ink-600 ${
        lead ? "shimmer" : ""
      }`}
    >
      <Shot p={p} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-semibold tracking-tight">{p.title}</h3>
          <span className="shrink-0 font-mono text-[10px] text-fg-subtle">
            {lead ? "Featured" : p.period}
          </span>
        </div>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-fg-muted">
          {p.blurb}
        </p>

        {p.tech?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {p.tech.slice(0, 4).map((t) => (
              <li
                key={t}
                className="rounded border border-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-fg-subtle"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {/* At the foot of the card rather than after the copy, so
            the links sit on one line across the whole rail instead
            of stepping up and down with each blurb. */}
        <div className="mt-auto flex items-center gap-4 pt-4">
          {/* Something on the line rather than nothing. Half of
              these have no repository to send you to and no site
              to open, and a card whose last row is empty reads as
              one whose links failed to render. */}
          {p.private && (
            <span className={`${LINK} text-fg-subtle`}>Private</span>
          )}
          {p.live && (
            <a
              href={p.live}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-accent hover:text-fg`}
            >
              Live site &rarr;
            </a>
          )}
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} text-fg-subtle hover:text-fg`}
            >
              Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects({ ref }) {
  const plain = usePlain();
  // Embla is the engine shadcn's Carousel is built on: drag, wheel,
  // snapping, bounds and keyboard, in about five kilobytes, and
  // nothing running when the rail is still. Rolling this by hand
  // means reimplementing momentum and edge cases that are already
  // somebody's job.
  const [railRef, embla] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      // Free scrolling: the rail goes as far as you push it and
      // coasts to a stop. Snapping meant one gesture moved one
      // card however hard you pushed, so spinning the wheel ten
      // times crawled along a card at a time instead of travelling.
      // The arrows still step card to card, which is what they are
      // for.
      dragFree: true,
    },
    // Sideways on a trackpad moves the rail.
    //
    // The plugin takes the dominant axis of the gesture, so a
    // vertical flick still scrolls the page and only a horizontal
    // one touches the carousel. That distinction is the whole
    // reason to take the plugin rather than listen for wheel
    // events here: a rail that answers to any wheel at all is a
    // rail you get caught in on the way down the page.
    [WheelGesturesPlugin()],
  );

  if (!plain) {
    return (
      <Stop id="projects" title="Projects" n={3} plain={false} refEl={ref}>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              <h3>{p.title}</h3>
              <p>{p.period}</p>
              <p>{p.blurb}</p>
              <p>{p.tech.join(" · ")}</p>
              <span>
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener noreferrer">
                    Live
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noopener noreferrer">
                    Code
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Stop>
    );
  }

  return (
    <Stop
      id="projects"
      title="Projects"
      n={3}
      plain
      refEl={ref}
      // Arrows as well as the drag: a rail that only answers to a
      // sideways gesture is one most people on a mouse never find
      // the end of. On the heading's line they cost no height and
      // sit clear of the cards.
      aside={
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => embla?.scrollPrev()}
            aria-label="Previous projects"
            className={STEP}
          >
            <span aria-hidden>&larr;</span>
          </button>
          <button
            onClick={() => embla?.scrollNext()}
            aria-label="More projects"
            className={STEP}
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      }
    >
      <div className="relative">
        <div ref={railRef} className="overflow-hidden">
          <div className="flex gap-5">
            {projects.map((p, i) => (
              <Card key={p.id} p={p} lead={i === 0} />
            ))}
          </div>
        </div>

        {/* The rail runs under the right edge rather than stopping
            at it, which is the one thing on screen saying there is
            more of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent"
        />
      </div>
    </Stop>
  );
}
