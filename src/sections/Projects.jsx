import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { setShown, useShown } from "../lib/shown";
import { cn } from "../lib/cn";
import { projects } from "../data/projects";

/**
 * The desk in the study. The monitor in the scene shows whichever
 * project is selected; this list is what selects it.
 *
 * Pointing at a row is enough - there is nothing to confirm, and making
 * someone click to see a screen they are already looking at would be a
 * step for its own sake.
 */
function Row({ p, on }) {
  return (
    <button
      onMouseEnter={() => setShown(p.id)}
      onFocus={() => setShown(p.id)}
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        on
          ? "border-ink-600 bg-ink-800/70"
          : "border-ink-700/70 hover:border-ink-600 hover:bg-ink-900/70",
      )}
    >
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-medium text-fg">{p.title}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
          {p.period}
        </span>
      </span>
      <span className="mt-1 block text-sm leading-relaxed text-fg-muted">
        {p.blurb}
      </span>
      <span className="mt-2 flex flex-wrap gap-3 text-xs">
        {p.live && (
          <a
            href={p.live}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
            className="text-fg-muted hover:text-fg"
          >
            Code
          </a>
        )}
      </span>
    </button>
  );
}

export default function Projects({ ref }) {
  const plain = usePlain();
  const shown = useShown();

  return (
    <Stop id="projects" title="Projects" plain={plain} refEl={ref}>
      <div
        className={
          plain ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "space-y-2.5"
        }
      >
        {projects.map((p) => (
          <Row key={p.id} p={p} on={!plain && p.id === shown} />
        ))}
      </div>
    </Stop>
  );
}
