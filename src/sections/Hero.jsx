import { useEffect, useState } from "react";
import { motion } from "motion/react";
import TiltCard from "../components/TiltCard";
import { usePlain } from "../lib/plain";
import { profile, RESUME_URL } from "../data/profile";
import { education } from "../data/about";

/**
 * The establishing shot: the whole town in one frame, with nothing on
 * it but a name.
 *
 * Who I am, what I do and what I am working on used to live here as a
 * floating block. They have moved onto the hoarding in the scene,
 * which is the next stop - a sign you walk up to and read, rather than
 * a caption hanging over the view of the town.
 *
 * Narrow screens and the plain read get the flat layout instead: no
 * canvas mounts at all, so the photo and the copy come back as DOM.
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

  // --- phones, and anyone who asked for the plain read ------------------
  if (flat) {
    return (
      <section
        ref={ref}
        className="pointer-events-auto relative w-full scroll-mt-16"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-[1fr_340px]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle">
              {profile.role} &middot; {profile.location}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
              {profile.tagline}
            </p>
            <p className="mt-5 text-sm text-fg-muted">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
                Currently
              </span>{" "}
              &mdash; {profile.currently}
            </p>
            <p className="mt-5 font-mono text-xs tracking-wide text-fg-subtle">
              Graduating {education.graduation} &middot; GPA {education.gpa}
            </p>
            <div className="mt-8">
              <Actions />
            </div>
          </div>

          <TiltCard className="order-first mx-auto w-full max-w-[272px] md:order-none md:ml-auto md:mr-0">
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
        </div>
      </section>
    );
  }

  // `null` means the media query has not resolved. Render the shell
  // only, so a phone never briefly mounts a canvas it throws away.
  if (narrow === null) {
    return <section ref={ref} className="h-[94vh] min-h-[620px]" />;
  }

  return (
    <section
      ref={ref}
      className="pointer-events-auto relative flex h-[94vh] min-h-[620px] w-full items-start overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20">
        <Rise>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle">
            Welcome
          </p>
        </Rise>
        <Rise delay={0.08}>
          <h1 className="mt-3 text-6xl font-semibold tracking-tight lg:text-7xl">
            {profile.name}
          </h1>
        </Rise>
        <Rise delay={0.2}>
          <div className="mt-8">
            <Actions />
          </div>
        </Rise>
      </div>
    </section>
  );
}
