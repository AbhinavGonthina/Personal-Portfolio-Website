import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { socials } from "../data/profile";

/**
 * The mailboxes at the end of the path. Hovering one in the scene opens
 * its lid and puts the flag up; clicking it opens the link. These are
 * the same four, as links, for anyone not using a pointer.
 */
export default function Connect({ ref }) {
  const plain = usePlain();

  return (
    <Stop id="connect" title="Contact" plain={plain} refEl={ref}>
      <p className="mb-6 text-sm leading-relaxed text-fg-muted">
        {plain
          ? "Four ways to reach me."
          : "Four mailboxes at the end of the path \u2014 open one, or use these."}
      </p>
      <ul className="space-y-2.5">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="flex items-baseline justify-between gap-4 rounded-lg border border-ink-700/70 px-4 py-3 transition-colors hover:border-ink-600 hover:bg-ink-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
                {s.name}
              </span>
              <span className="text-sm text-fg">{s.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </Stop>
  );
}
