import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Aceternity UI's Timeline, adapted.
 *
 * Taken from its shadcn registry entry rather than installed,
 * because the CLI wants a shadcn project and this is not one. Its
 * only dependency is `motion`, which the site already uses.
 *
 * Changed from upstream:
 *
 * - TypeScript stripped, and the unused `useMotionValueEvent`
 *   import with it.
 * - Its own heading and standfirst removed. The component shipped
 *   with "Changelog from my journey" hard-coded into it; here the
 *   section above supplies the heading.
 * - The light/dark neutral palette swapped for this site's ink
 *   scale, and the purple-to-blue beam for the one accent.
 * - The rhythm tightened. Upstream spaces entries by `pt-40` and
 *   wraps the whole thing in `py-20`, which is right for a page
 *   that is only a timeline and far too much for a section inside
 *   one.
 *
 * - The rail is no longer Aceternity's Timeline beam. That one
 *   grows from the top as you scroll, which is a progress bar,
 *   and the scroll bar had already said it. It is now drawn the
 *   way their TracingBeam draws one: a gradient window travelling
 *   down the line, sprung at both ends so it overshoots and
 *   settles when you stop. See the comment on the `<svg>`.
 *
 * Either way there is no loop running - the motion values are
 * driven by scroll progress, so the work happens only while the
 * page is moving.
 */
export default function Timeline({ data, tight = false }) {
  // Experience renders one of these per group, so the gradient
  // cannot be called "rail". Three elements in a document with the
  // same id is not an error anyone reports - `url(#rail)` simply
  // resolves to the first of them, and the other two rails were
  // being painted with the first one's scroll position.
  //
  // Stripped of punctuation, because React 19 hands back ids like
  // `«r0»` and those two characters are not valid in a fragment
  // reference - `url(#«r0»)` resolves to nothing at all, silently,
  // and the rail simply does not paint.
  const railId = `rail${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  // The two ends of the lit window, as pixels down the rail. They
  // run at different rates and over different ranges, so the band
  // stretches on the way in and gathers at the bottom rather than
  // sliding down as a fixed block.
  //
  // Sprung, which is the whole character of it: stop scrolling and
  // the light carries on a little and settles.
  const SPRING = { stiffness: 420, damping: 80 };
  const lead = useSpring(
    useTransform(scrollYProgress, [0, 1], [-180, height - 40]),
    SPRING,
  );
  const tail = useSpring(
    useTransform(scrollYProgress, [0, 1], [120, height + 140]),
    SPRING,
  );
  const fade = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full" ref={containerRef}>
      <div ref={ref} className="relative mx-auto">
        {data.map((item, index) => (
          <div
            key={index}
            // The first entry needs no lead-in: whatever introduced
            // the rail is already directly above it, and upstream's
            // top padding put a hand's width of nothing between the
            // two.
            className={`flex justify-start lg:gap-10 ${
              index === 0 ? "pt-0" : "pt-10 md:pt-14"
            }`}
          >
            {/* The date rides down the screen with you until the next
                one pushes it off, which is what ties a long entry to
                the year it belongs to. */}
            {/* The side column arrives at `lg`, not `md`.
                It reserves 260px for a date that is never longer than
                "JUN - AUG 2026", which is worth it on a wide screen
                and ruinous on a tablet: at 834 it took a third of the
                page for one line of mono and left the card beside it
                too narrow to put anything side by side in. Below
                `lg` the date goes back above the entry, where it
                costs a line instead of a column. */}
            <div
              className="sticky top-28 z-40 flex max-w-xs flex-col items-start self-start lg:w-full lg:flex-row lg:items-center"
              style={{ maxWidth: tight ? 170 : 260 }}
            >
              <div className="absolute left-0 flex size-10 items-center justify-center rounded-full bg-ink-950">
                <div className="size-3 rounded-full border border-ink-600 bg-ink-800" />
              </div>
              <h3 className="hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle lg:block lg:pl-16">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-14 pr-0 sm:pl-16 lg:pl-4">
              <h3 className="mb-4 block font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle lg:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* The rail, drawn the way Aceternity's TracingBeam draws
            one rather than as a div that grows.

              https://ui.aceternity.com/components/tracing-beam

            A growing bar says how much of the section is behind
            you, which is a progress bar and the scroll bar already
            said it. A gradient window travelling down a line says
            where you are, which is the thing worth saying - and
            because the window is a `linearGradient` whose two ends
            are springs, it overshoots and settles when you stop
            instead of halting dead.

            Two paths over each other: the track, which is always
            there, and the lit one, stroked with the gradient. Both
            are the same straight line - upstream's has a kink at
            the top where it steps in from the margin, and there is
            no margin to step in from here. */}
        <svg
          aria-hidden
          width="2"
          height={height}
          viewBox={`0 0 2 ${height}`}
          className="pointer-events-none absolute left-5 top-0 overflow-visible"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2={height}
            stroke="var(--color-ink-700)"
            strokeWidth="1"
          />
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2={height}
            stroke={`url(#${railId})`}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ opacity: fade }}
            className="motion-reduce:hidden"
          />
          <defs>
            {/* Painted in user space, so the two offsets are
                pixels down the rail and not fractions of it. */}
            <motion.linearGradient
              id={railId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={lead}
              y2={tail}
            >
              <stop stopColor="var(--color-accent)" stopOpacity="0" />
              <stop offset="0.25" stopColor="var(--color-accent)" />
              <stop offset="0.72" stopColor="#8b7bff" />
              <stop offset="1" stopColor="#8b7bff" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
