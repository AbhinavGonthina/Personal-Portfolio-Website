import Section from "../components/Section";
import { projects } from "../data/projects";

/** Flat grid, every project shown. Category filtering comes back later. */
export default function Projects() {
  return (
    <Section id="projects" title="Projects">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.id}
            className="flex flex-col rounded-lg border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-ink-600"
          >
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="mt-0.5 font-mono text-xs text-fg-subtle">
              {p.period}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {p.blurb}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-md border border-ink-700 bg-ink-850 px-2 py-0.5 text-xs text-fg-muted"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex gap-4 pt-5 text-sm">
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
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
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
