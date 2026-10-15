import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { projects } from "../data/projects";

/**
 * The monitor on the desk. One scroll of this section walks the whole
 * list across the screen, which is why the section is two viewports
 * tall and the camera holds still across it - the marker below is the
 * second of the two stops it holds between.
 */
export default function Projects({ ref, markRef }) {
  const plain = usePlain();

  return (
    <Stop
      id="projects"
      title="Projects"
      plain={plain}
      refEl={ref}
      markRef={plain ? null : markRef}
      tall
    >
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
