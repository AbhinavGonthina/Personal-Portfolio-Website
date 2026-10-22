import { motion, useReducedMotion } from "motion/react";
import githubMark from "bootstrap-icons/icons/github.svg?raw";
import linkedinMark from "bootstrap-icons/icons/linkedin.svg?raw";
import envelopeMark from "bootstrap-icons/icons/envelope.svg?raw";
import fileMark from "bootstrap-icons/icons/file-earmark-text.svg?raw";
import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { profile, socials } from "../data/profile";

/**
 * The mailboxes at the end of the path. Hovering one in the scene
 * opens its lid and raises the flag; clicking it opens the link. The
 * same four, as plain links, for everyone else.
 *
 * The last section, and the shortest. It was four full-width rows
 * under a block of type, which gave the one section with nothing to
 * read more height than Skills - and because it is last, every pixel
 * it did not need was a pixel of empty document under it. Four
 * buttons across one row, and the page stops.
 */

const MARKS = {
  github: githubMark,
  linkedin: linkedinMark,
  email: envelopeMark,
  resume: fileMark,
};

/**
 * The invitation, a word at a time.
 *
 * Set as one block it is a sentence you have already finished reading
 * before it finishes arriving. A word at a time it is still only half
 * a second in total, but it lands the way somebody says it rather
 * than the way a page loads, and the last thing before the buttons is
 * the thing that asks you to use them.
 *
 * Once, on the way in, and never again - `once` on the viewport, so
 * scrolling back past it does not replay. Honoured by the reduced
 * motion setting, where it is simply text.
 */
function Line({ children, className, delay = 0 }) {
  const still = useReducedMotion();
  const words = String(children).split(" ");
  if (still) return <span className={className}>{children}</span>;
  return (
    <motion.span
      className={className}
      initial="out"
      whileInView="in"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: 0.028, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <motion.span
          // The word and its following space move together, or the
          // line reflows as each one lands.
          key={`${w}-${i}`}
          className="inline-block whitespace-pre"
          variants={{
            out: { opacity: 0, y: "0.4em" },
            in: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

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
      {/* No `max-w-2xl` on this one. Every other section is held to
          the column because it is reading matter; this is the one
          line on the page that is addressed to somebody, and it
          takes the full width the rest of the page is built on. */}
      <p className="-mt-6 text-2xl leading-snug tracking-tight sm:text-3xl md:text-4xl">
        <Line>{profile.currently}</Line>
        <Line className="mt-3 block text-fg-muted" delay={0.22}>
          If you would like to hear more about any of it, I would be glad to
          talk.
        </Line>
      </p>

      {/* One row, four buttons, the mark and the word inside each.
          The handles themselves are gone from the face of them: an
          email address and a GitHub username are what happens after
          the click, not what makes somebody click. */}
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              title={s.value}
              className="group flex items-center justify-center gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-4 py-4 transition-colors hover:border-accent/50 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden
                className="size-5 shrink-0 text-fg-subtle transition-colors group-hover:text-accent [&>svg]:size-full"
                dangerouslySetInnerHTML={{ __html: MARKS[s.icon] }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted transition-colors group-hover:text-fg">
                {s.name}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-10 border-t border-ink-800 pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
        &copy; {new Date().getFullYear()} {profile.name}
      </p>
    </Stop>
  );
}
