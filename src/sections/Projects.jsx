import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { projects } from "../data/projects";

/** GitHub's dot colour per language, the same key the monitor uses. */
const LANG_DOT = {
  "Next.js": "#3178c6",
  React: "#61dafb",
  "React Native": "#61dafb",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Python: "#3572a5",
  Racket: "#3c5caa",
};

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

function Shot({ p, tall }) {
  const src = p.image ?? p.poster;
  if (!src) return null;
  // Two of these have a wordmark where the others have a screenshot.
  // Cropped to fill like a screenshot, a wide logo comes out as four
  // letters of itself - "Rainfo" - so a logo is fitted inside the
  // frame instead, with room around it.
  const logo = src.includes("/logos/");
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-ink-700 bg-ink-900 ${
        tall ? "aspect-[16/9]" : "aspect-[16/10]"
      }`}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`size-full transition-transform duration-500 group-hover:scale-[1.03] ${
          logo ? "object-contain p-10" : "object-cover object-top"
        }`}
      />
      {/* The screenshots are of light interfaces and this page is not
          one. A wash off the bottom edge stops each card ending in a
          hard white band. */}
      {!logo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent"
        />
      )}
    </div>
  );
}

function Links({ p }) {
  if (!p.live && !p.github) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4">
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
  );
}

function Tech({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-5 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li
          key={t}
          className="rounded border border-ink-700 px-2 py-0.5 font-mono text-[11px] text-fg-subtle"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Card({ p, lead }) {
  return (
    <article
      className={`group flex flex-col rounded-xl border border-ink-700 bg-ink-900/40 p-5 transition-colors hover:border-ink-600 ${
        lead ? "md:col-span-2 md:flex-row md:items-center md:gap-8 md:p-7" : ""
      }`}
    >
      <div className={lead ? "md:w-1/2" : ""}>
        <Shot p={p} tall={lead} />
      </div>

      <div className={lead ? "mt-6 md:mt-0 md:w-1/2" : "mt-5"}>
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className={`font-semibold tracking-tight ${lead ? "text-2xl" : "text-lg"}`}
          >
            {p.title}
          </h3>
          <span className="shrink-0 font-mono text-[11px] text-fg-subtle">
            {p.period}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {lead ? (p.description ?? p.blurb) : p.blurb}
        </p>

        <Tech items={p.tech} />
        <Links p={p} />
      </div>
    </article>
  );
}

export default function Projects({ ref }) {
  const plain = usePlain();

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

  const [lead, ...rest] = projects;

  return (
    <Stop id="projects" title="Projects" n={3} plain refEl={ref}>
      {/* One is the headline and ten are a list.
          Eleven cards with a screenshot each ran to four screens,
          and a reader who has to scroll that far to find out how
          many there are has stopped counting by the third. The one
          worth stopping on keeps its picture; the rest become rows
          you can take in at a glance and open if you want. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <article className="shimmer group relative flex flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/50 p-5">
          <Shot p={lead} tall />
          <div className="mt-5 flex flex-1 flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-2xl font-semibold tracking-tight">
                {lead.title}
              </h3>
              <span className="shrink-0 font-mono text-[11px] text-accent/80">
                Featured
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {lead.blurb}
            </p>
            <Tech items={lead.tech} />
            <Links p={lead} />
          </div>
        </article>

        <ul className="divide-y divide-ink-800 border-y border-ink-800">
          {rest.map((p) => {
            const href = p.live ?? p.github;
            const Row = href ? "a" : "div";
            return (
              <li key={p.id}>
                <Row
                  {...(href
                    ? { href, target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-baseline gap-4 py-3 transition-colors hover:bg-ink-900/40"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ background: LANG_DOT[p.tech?.[0]] ?? "#6e7681" }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-3">
                      <span className="font-medium tracking-tight transition-colors group-hover:text-accent">
                        {p.title}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-fg-subtle">
                        {p.tech?.[0]}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-fg-muted">
                      {p.blurb}
                    </span>
                  </span>
                  {href && (
                    <span
                      aria-hidden
                      className="shrink-0 text-fg-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      &rarr;
                    </span>
                  )}
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </Stop>
  );
}
