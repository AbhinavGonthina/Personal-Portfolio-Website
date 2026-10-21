import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
 * The beam is the point of it: a line down the left that fills as
 * the section passes the middle of the screen. It is two motion
 * values driven by scroll progress, so there is no loop running -
 * the work happens only while the page is moving.
 */
export default function Timeline({ data }) {
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

  const fill = useTransform(scrollYProgress, [0, 1], [0, height]);
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
            className={`flex justify-start md:gap-10 ${
              index === 0 ? "pt-0" : "pt-10 md:pt-14"
            }`}
          >
            {/* The date rides down the screen with you until the next
                one pushes it off, which is what ties a long entry to
                the year it belongs to. */}
            <div className="sticky top-28 z-40 flex max-w-xs flex-col items-start self-start md:w-full md:max-w-[260px] md:flex-row md:items-center">
              <div className="absolute left-0 flex size-10 items-center justify-center rounded-full bg-ink-950 md:left-0">
                <div className="size-3 rounded-full border border-ink-600 bg-ink-800" />
              </div>
              <h3 className="hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.16em] text-fg-subtle md:block md:pl-16">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-16 pr-0 md:pl-4">
              <h3 className="mb-4 block font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute left-5 top-0 w-px overflow-hidden bg-[linear-gradient(to_bottom,transparent_0%,var(--color-ink-700)_10%,var(--color-ink-700)_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: fill, opacity: fade }}
            className="absolute inset-x-0 top-0 w-px rounded-full bg-gradient-to-t from-accent via-accent/40 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
