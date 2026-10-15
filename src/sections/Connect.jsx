import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { socials } from "../data/profile";

/**
 * The mailboxes at the end of the path. Hovering one in the scene
 * opens its lid and raises the flag; clicking it opens the link. The
 * same four, as plain links, for everyone else.
 */
export default function Connect({ ref }) {
  const plain = usePlain();

  return (
    <Stop id="connect" title="Contact" plain={plain} refEl={ref}>
      <ul className="space-y-2.5">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="flex items-baseline justify-between gap-4 rounded-lg border border-ink-700/70 px-4 py-3 transition-colors hover:border-ink-600 hover:bg-ink-900/70"
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
