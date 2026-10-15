import { useEffect, useState } from "react";
import { motion } from "motion/react";
import TiltCard from "../components/TiltCard";
import { usePlain } from "../lib/plain";
import { profile, RESUME_URL } from "../data/profile";

/**
 * The far end of the street.
 *
 * The name and the portrait are not here - they are standing on the
 * pavement in the scene behind this, which is the same canvas the
 * Experience section uses. This section is the copy that has to be
 * selectable, linkable and readable by a crawler, laid over it.
 *
 * Narrow screens and the plain read get the flat layout instead: no
 * canvas is mounted at all, so the name and the photo come back as DOM.
 */

const EASE = [0.22, 1, 0.36, 1];

const BTN =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Actions() {
  return (
    <div className="flex flex-wrap gap-3">
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
  );
}

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

export default function Hero({ ref }) {
  const plain = usePlain();
  const [narrow, setNarrow] = useState(null);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const flat = narrow || plain;

  return (
    <section
      ref={ref}
      className="pointer-events-auto relative flex min-h-[94vh] w-full items-start overflow-hidden"
    >
      <div className={cnGrid(flat)}>
        <div>
          <Rise>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle">
              {profile.role} &middot; {profile.location}
            </p>
          </Rise>

          {/* On a wide screen the name is lettering standing in the
              scene, so this one is only here to be read by machines. */}
          <Rise delay={0.08}>
            <h1
              className={
                flat
                  ? "mt-4 text-5xl font-semibold tracking-tight sm:text-6xl"
                  : "sr-only"
              }
            >
              {profile.name}
            </h1>
          </Rise>

          <Rise delay={0.16}>
            <p
              className={`max-w-xl leading-relaxed text-fg-muted ${flat ? "mt-6" : "mt-4"}`}
            >
              {profile.tagline}
            </p>
          </Rise>

          <Rise delay={0.22}>
            <p className="mt-4 flex items-start gap-2.5 text-sm text-fg-muted">
              <span
                aria-hidden
                className="mt-1.5 size-1.5 shrink-0 animate-pulse rounded-full bg-fg"
              />
              <span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
                  Currently
                </span>{" "}
                &mdash; {profile.currently}
              </span>
            </p>
          </Rise>

          <Rise delay={0.36}>
            <div className="mt-6">
              <Actions />
            </div>
          </Rise>
        </div>

        {flat && (
          <Rise delay={0.18} className="order-first md:order-none">
            <TiltCard className="mx-auto w-full max-w-[272px] md:ml-auto md:mr-0">
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
              </div>
            </TiltCard>
          </Rise>
        )}
      </div>
    </section>
  );
}

/**
 * Two columns when the portrait is in the DOM, one when it is in the
 * scene - and narrower in that case, so the copy stays clear of the
 * hoarding standing on the right of the road.
 */
const cnGrid = (flat) =>
  flat
    ? "relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1fr_340px]"
    : "relative mx-auto w-full max-w-6xl px-6 pb-24 pt-14 [&>div]:max-w-lg";
