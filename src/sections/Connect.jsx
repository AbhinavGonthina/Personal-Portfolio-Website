import { motion, useReducedMotion } from "motion/react";
import githubMark from "bootstrap-icons/icons/github.svg?raw";
import linkedinMark from "bootstrap-icons/icons/linkedin.svg?raw";
import envelopeMark from "bootstrap-icons/icons/envelope.svg?raw";
import fileMark from "bootstrap-icons/icons/file-earmark-text.svg?raw";
import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { useLevel } from "../lib/readLevel";
import { useTheme } from "../lib/theme";
import { Dots, Wash } from "../components/rich/Backdrop";
import Glow from "../components/rich/Glow";
import BorderBeam from "../components/rich/BorderBeam";
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
 * A colour per button, so the last thing on the page is a row of
 * four things rather than one thing four times.
 *
 * They are the same five hues the skill cards use, which is what
 * stops this reading as a new idea introduced in the last section.
 */
const TINT = {
  dark: {
    github: "#8fa8ff",
    linkedin: "#6fe3f5",
    email: "#b48bff",
    resume: "#6bd99a",
  },
  light: {
    github: "#3b55b8",
    linkedin: "#0e7f94",
    email: "#6a3fbd",
    resume: "#1d7a4c",
  },
};

/**
 * The first line, typed.
 *
 * A character at a time across one second, which is slow enough to
 * watch and quick enough that nobody is waiting on it. Every
 * character is in the document from the start and only its opacity
 * changes, so the line is laid out once - a line that grows by a
 * letter at a time reflows on every letter, and a centred one
 * slides sideways while it does.
 *
 * Once, on the way in, and never again - `once` on the viewport, so
 * scrolling back past it does not replay. Honoured by the reduced
 * motion setting, where it is simply text.
 */
const TYPED_FOR = 1;

function Typed({ children, className }) {
  const still = useReducedMotion();
  const text = String(children);
  if (still) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={className}
      initial="out"
      whileInView="in"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: TYPED_FOR / text.length }}
    >
      {[...text].map((c, i) => (
        <motion.span
          // Plain inline spans, not inline-block. A box per letter
          // would let the line break inside a word; inline spans
          // leave the browser's own break opportunities alone.
          key={i}
          variants={{ out: { opacity: 0 }, in: { opacity: 1 } }}
          transition={{ duration: 0 }}
        >
          {c}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * The second line, which does not type. Two typewriters in a row is
 * a gimmick; one sentence arriving and the next one appearing under
 * it while you are still reading the first is how it would be said.
 */
function Fade({ children, className, delay = 0 }) {
  const still = useReducedMotion();
  if (still) return <span className={className}>{children}</span>;
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}

/**
 * The arrow under the invitation, easing down and back the length
 * of a slow breath. Lifted from the landing's scroll hint so the
 * one gesture the site makes for "keep going" is the same gesture
 * in both places.
 */
function Chevron() {
  const still = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="mt-7 flex justify-center text-fg-subtle"
      initial={still ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, delay: still ? 0 : TYPED_FOR + 0.75 }}
    >
      <motion.span
        animate={still ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="26" height="15" viewBox="0 0 18 11" fill="none">
          <path
            d="M1 1l8 8 8-8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>
    </motion.div>
  );
}

export default function Connect({ ref }) {
  const plain = usePlain();
  const rich = useLevel() !== "bare";
  const tints = TINT[useTheme()] ?? TINT.dark;

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
    <Stop id="connect" title="Contact" n={4} plain foot refEl={ref}>
      {rich && (
        <>
          <Dots className="opacity-40" />
          <Wash tint="var(--color-accent)" at="50% 100%" size="60% 70%" />
        </>
      )}
      {/* No `max-w-2xl` on this one. Every other section is held to
          the column because it is reading matter; this is the one
          thing on the page addressed to somebody, so it takes the
          full width the rest of the page is built on and sits in
          the middle of it. */}
      <p className="pt-2 text-center text-lg leading-snug tracking-tight sm:text-xl md:text-2xl">
        <Typed>{profile.currently}</Typed>
        {/* After the typing, not alongside it. */}
        <Fade
          className="mt-4 block text-base text-fg-muted sm:text-lg"
          delay={TYPED_FOR + 0.15}
        >
          Please don&apos;t hesitate to reach out through any of the following
        </Fade>
      </p>

      {/* The same chevron the landing uses to say there is more
          below, doing the same job one last time - except here what
          is below is four buttons rather than another screen, so it
          points at them from a hand's width away rather than from
          the foot of the window.

          It waits for the sentence above it to finish arriving.
          Starting together, the arrow is pointing at nothing for
          half a second while the words it belongs to are still
          landing. */}
      <Chevron />

      {/* One row, four buttons, the mark and the word inside each.
          The handles themselves are gone from the face of them: an
          email address and a GitHub username are what happens after
          the click, not what makes somebody click. */}
      <ul className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {socials.map((s, i) => (
          <li key={s.name}>
            {/* The same ring the cards wear. A page whose last four
                controls behave differently from everything above
                them reads as two pages. */}
            <Glow
              on={rich}
              as="a"
              tint={tints[s.icon]}
              href={s.href}
              {...(s.icon === "email"
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              title={s.value}
              className="group flex items-center justify-center gap-3 rounded-xl border border-ink-700 bg-ink-900/40 px-4 py-4 transition-colors hover:border-accent/50 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden
                // The mark takes the button's own colour on hover
                // rather than the one accent, so the four of them
                // answer differently.
                className={`size-5 shrink-0 text-fg-subtle transition-colors [&>svg]:size-full ${
                  rich ? "group-hover:text-(--hue)" : "group-hover:text-accent"
                }`}
                style={rich ? { "--hue": tints[s.icon] } : undefined}
                dangerouslySetInnerHTML={{ __html: MARKS[s.icon] }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted transition-colors group-hover:text-fg">
                {s.name}
              </span>

              {/* A light going round each one, started a beat
                  apart. This is the last thing on the page and it
                  was the stillest: four identical outlines under a
                  sentence asking somebody to get in touch. Four
                  lights running at different points on the same
                  loop is the row saying it is live without anything
                  being added to it. */}
              {rich && (
                <BorderBeam
                  size={70}
                  duration={11}
                  delay={i * 2.75}
                  colorFrom={tints[s.icon]}
                  colorTo="transparent"
                />
              )}
            </Glow>
          </li>
        ))}
      </ul>

      {/* The copyright, and the one other place worth going.
          Opposite ends of the same rule: the line under the page is
          where a site keeps the things that are true of it rather
          than part of it, and the version this one replaced is
          exactly that. */}
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-ink-800 pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}
        </p>
        <a
          href="/legacy/"
          className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Legacy website &rarr;
        </a>
      </div>
    </Stop>
  );
}
