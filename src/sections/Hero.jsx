import { motion } from "motion/react";
import RetroGrid from "../components/RetroGrid";
import TiltCard from "../components/TiltCard";
import { experience } from "../data/experience";
import { profile, RESUME_URL } from "../data/profile";
import { education } from "../data/about";

/**
 * The street the Experience section is further down, drawn flat.
 *
 * It was briefly a second WebGL scene - the same pavement, the city on
 * the horizon - and it made the skyline below it stutter. Two live GL
 * contexts on one page is a bill the page cannot pay, so everything here
 * is CSS: a receding grid that echoes the skyline's floor, a smear of
 * light along the horizon, and the portrait turning on a real perspective
 * transform. All of it is composited; none of it repaints.
 *
 * The colour comes from `experience[].accent` and nowhere else - the
 * eight role colours, smeared behind the horizon as light pollution. The
 * palette is earned from the content instead of invented for decoration,
 * which is why the rest of the site can stay strictly white on black.
 */

const EASE = [0.22, 1, 0.36, 1];

const BTN =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/**
 * Light pollution. Three of the eight accents are reds and they sit next
 * to each other in the data, so the stops are interleaved - taken in
 * order they painted a solid red wall across half the horizon.
 */
const ACCENTS = experience.map((r) => r.accent);
const SPREAD = ACCENTS.filter((_, i) => i % 2 === 0).concat(
  ACCENTS.filter((_, i) => i % 2 === 1).reverse(),
);
const HORIZON = SPREAD.map(
  (hex, i) =>
    `radial-gradient(42rem 14rem at ${(i / (SPREAD.length - 1)) * 100}% 100%, ${hex}55, transparent 72%)`,
).join(", ");

function Rise({ delay = 0, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative flex min-h-[94vh] w-full items-center overflow-hidden bg-black">
      <RetroGrid className="top-auto h-[62%]" />

      {/* The city, out of sight, throwing its light up at the sky. Plain
          radial gradients rather than a blurred element: `filter: blur`
          on something this size costs a full-screen pass every frame it
          is composited, and the gradient is already soft. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[38%] h-80"
        style={{ background: HORIZON }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[38%] h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1fr_340px]">
        <div>
          <Rise>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle">
              {profile.role} &middot; {profile.location}
            </p>
          </Rise>

          <Rise delay={0.08}>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              {profile.name}
            </h1>
          </Rise>

          <Rise delay={0.16}>
            <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
              {profile.tagline}
            </p>
          </Rise>

          <Rise delay={0.24}>
            <p className="mt-6 font-mono text-xs tracking-wide text-fg-subtle">
              Graduating {education.graduation} &middot; GPA {education.gpa}{" "}
              &middot; {education.honors}
            </p>
          </Rise>

          <Rise delay={0.32}>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("experience")}
                className={`${BTN} bg-fg text-ink-950 hover:opacity-90`}
              >
                View my work
              </button>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} border border-ink-600 text-fg hover:bg-ink-800`}
              >
                Resume
              </a>
            </div>
          </Rise>
        </div>

        <Rise delay={0.18} className="order-first md:order-none">
          <TiltCard className="mx-auto w-full max-w-[340px] md:ml-auto md:mr-0">
            {/* Each layer stands a little further off the card, so turning
                it slides them past each other. The bezel is the same
                treatment the badges wear on the buildings. */}
            <div className="relative rounded-xl border border-white/10 bg-ink-900/60 p-2 [transform:translateZ(0px)]">
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={820}
                height={820}
                className="w-full rounded-lg [transform:translateZ(28px)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-2 rounded-lg ring-1 ring-inset ring-white/25 [transform:translateZ(44px)]"
              />
              <span className="absolute -bottom-3 left-5 rounded-full border border-white/15 bg-ink-950 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted [transform:translateZ(70px)]">
                {education.graduation}
              </span>
            </div>
          </TiltCard>
        </Rise>
      </div>
    </section>
  );
}
