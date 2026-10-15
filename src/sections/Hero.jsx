import { motion } from "motion/react";
import TiltCard from "../components/TiltCard";
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
 */

const EASE = [0.22, 1, 0.36, 1];

const BTN =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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
      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-44 pt-24 md:grid-cols-[1fr_340px]">
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
          <TiltCard className="mx-auto w-full max-w-[272px] md:ml-auto md:mr-0">
            {/* Each layer stands a little further off the card, so turning
                it slides them past each other. Thin bezel on something
                nearly square: the badges on the buildings are the
                reference, not a framed print. */}
            <div className="relative rounded-md border border-white/10 bg-ink-950 p-1 [transform:translateZ(0px)]">
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={820}
                height={820}
                className="w-full rounded-sm [transform:translateZ(22px)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-1 rounded-sm ring-1 ring-inset ring-white/15 [transform:translateZ(34px)]"
              />
              <span className="absolute -bottom-2.5 left-3 rounded border border-white/10 bg-ink-950 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-subtle [transform:translateZ(56px)]">
                {education.graduation}
              </span>
            </div>
          </TiltCard>
        </Rise>
      </div>
    </section>
  );
}
