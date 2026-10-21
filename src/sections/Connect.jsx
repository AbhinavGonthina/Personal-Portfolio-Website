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
      <p className="-mt-6 max-w-2xl text-2xl leading-snug tracking-tight sm:text-3xl">
        {profile.currently}
        <span className="block text-fg-muted">
          Email is the fastest way to reach me.
        </span>
      </p>

      {/* Rows, not four big boxes. As cards they were the largest
          objects on the page and said the least - a label, a
          handle, and a lot of air. A row gives the handle the size
          it deserves and still fits four of them without the
          section needing a screen of its own to hold them. */}
      <ul className="mt-12 divide-y divide-ink-800 border-y border-ink-800">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="group flex items-center gap-6 py-5 transition-colors hover:bg-ink-900/40"
            >
              <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-subtle">
                {s.name}
              </span>
              <span className="min-w-0 flex-1 truncate text-lg tracking-tight transition-colors group-hover:text-accent sm:text-xl">
                {s.value}
              </span>
              <span
                aria-hidden
                className="shrink-0 text-fg-subtle transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
              >
                &rarr;
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Stop>
  );
}
