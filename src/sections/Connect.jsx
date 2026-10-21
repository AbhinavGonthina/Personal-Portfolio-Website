import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { profile, socials } from "../data/profile";

/**
 * The mailboxes at the end of the path. Hovering one in the scene
 * opens its lid and raises the flag; clicking it opens the link. The
 * same four, as plain links, for everyone else.
 *
 * As a four-row table of label and value it was the quietest thing on
 * the page, which is the wrong note for the one section whose whole
 * job is to be acted on. Four cards, the value large enough to read
 * as the thing you came for, and a line above them saying what he is
 * actually after.
 */
export default function Connect({ ref }) {
  const plain = usePlain();

  if (!plain) {
    return (
      <Stop id="connect" title="Contact" n={4} plain={false} refEl={ref}>
        <ul className="space-y-2.5">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                {...(s.icon === "email"
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span>{s.name}</span>
                <span>{s.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </Stop>
    );
  }

  return (
    <Stop id="connect" title="Contact" n={4} plain refEl={ref}>
      <p className="-mt-4 mb-10 max-w-2xl text-lg leading-relaxed text-fg-muted">
        {profile.currently} The fastest way to reach me is email; everything
        else is below.
      </p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="group flex h-full flex-col justify-between rounded-xl border border-ink-700 bg-ink-900/40 p-5 transition-colors hover:border-accent/40 hover:bg-ink-900"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg-subtle">
                {s.name}
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-3">
                <span className="break-all text-base text-fg">{s.value}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-fg-subtle transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
                >
                  &rarr;
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Stop>
  );
}
