import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { projects } from "../data/projects";

/**
 * The monitor on the desk. The list is scrolled on the monitor itself
 * rather than by the page, so this is one ordinary section - it used
 * to be two viewports tall with a second camera stop at the bottom,
 * and all that bought was a viewport of scrolling where nothing
 * appeared to happen.
 */
export default function Projects({ ref }) {
  const plain = usePlain();

  return (
    <Stop id="projects" title="Projects" plain={plain} refEl={ref}>
      <ul className={plain ? "grid grid-cols-1 gap-4 md:grid-cols-2" : ""}>
        {projects.map((p) => (
          <li
            key={p.id}
            className={
              plain
                ? "flex flex-col rounded-lg border border-ink-700 bg-ink-900 p-5"
                : ""
            }
          >
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="mt-0.5 font-mono text-xs text-fg-subtle">
              {p.period}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {p.blurb}
            </p>
            <p className="mt-3 text-xs text-fg-subtle">{p.tech.join(" · ")}</p>
            <span className="mt-auto flex gap-4 pt-4 text-sm">
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg hover:underline"
                >
                  Live
                </a>
              )}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted hover:text-fg"
                >
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
