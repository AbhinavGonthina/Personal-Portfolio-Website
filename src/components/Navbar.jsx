import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";
import { setPlain, usePlain } from "../lib/plain";
import { setFocused } from "../lib/stage";

/**
 * Dressed to match the skyline below it: small mono capitals with wide
 * tracking, the same type the buildings carry on their facades, and the
 * links gathered into one lit capsule the way a badge sits inside its
 * bezel. Everything that moves is transform or opacity only.
 *
 * 1. A single pill slides between items via motion's shared-layout
 *    `layoutId`, rather than each item fading its own background. This is
 *    the whole trick - it reads as expensive and is almost free.
 * 2. The pill rests on whichever section you are actually looking at, and
 *    follows the pointer on hover. Tracked with an IntersectionObserver,
 *    so nothing runs per frame.
 * 3. The bar is bare at the top of the page and condenses into a bordered,
 *    blurred strip once you scroll - one boolean flipped at a threshold.
 */

const scrollTo = (id) => {
  // A focused building pins the page, so a nav link would do nothing
  // until you closed it by hand. Leaving is part of going somewhere.
  setFocused(null);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const LINK =
  "relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200";

export default function Navbar() {
  const plain = usePlain();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);

  // One boolean, flipped at a threshold - not a value bound to scroll
  // position, which would re-render on every frame of every scroll.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Which section the reader is in, measured rather than observed.
  //
  // An IntersectionObserver was doing this and kept the highlight a
  // section behind: it only reports what *changed*, so a callback can
  // arrive holding nothing but the section being left, and reconstructing
  // the full picture from a running map turned out to be just as much
  // code and still wrong across fast scrolls. Four rect reads on a scroll
  // that is already laying out is cheaper than being subtly broken.
  const sections = useRef([]);
  useEffect(() => {
    sections.current = NAV_ITEMS.map(({ id }) => [
      id,
      document.getElementById(id),
    ]).filter(([, el]) => el);
  }, []);

  useMotionValueEvent(scrollY, "change", () => {
    // A line a quarter of the way down the viewport: the section crossing
    // it is the one being read. Measuring at the middle lets a tall
    // section claim the highlight long before you reach it.
    const line = window.innerHeight * 0.25;
    let current = null;
    for (const [id, el] of sections.current) {
      if (el.getBoundingClientRect().top <= line) current = id;
    }
    // The last section is short and sits at the end of the document, so
    // its top can never reach the line - the page runs out of scroll
    // first. At the bottom, you are looking at it whatever the maths say.
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
      current = sections.current.at(-1)?.[0] ?? current;
    }
    setActive((prev) => (prev === current ? prev : current));
  });

  const marked = hovered ?? active;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-ink-700/70 bg-ink-950/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Hairline that brightens toward the middle. Fades in with the bar,
          so the edge reads as lit rather than ruled. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Three columns rather than a flex row, so the links sit on the
          centre of the page whatever the name on the left or the button on
          the right happen to be. */}
      <nav className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <button
          onClick={() => {
            setFocused(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group flex w-fit items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="size-1.5 rounded-full bg-fg transition-transform duration-300 group-hover:scale-150" />
          {profile.name}
        </button>

        <div
          className="relative hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onFocus={() => setHovered(item.id)}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                LINK,
                marked === item.id ? "text-fg" : "text-fg-subtle",
              )}
            >
              {marked === item.id && (
                <motion.span
                  layoutId="nav-pill"
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-white/[0.09] ring-1 ring-inset ring-white/15"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {item.label}
            </button>
          ))}
        </div>

        {/* The way out for anyone who would rather just read the thing. */}
        <div className="flex justify-end">
          <button
            onClick={() => setPlain(!plain)}
            aria-pressed={plain}
            className={cn(
              LINK,
              "hidden border border-white/10 text-fg-subtle hover:border-white/20 hover:text-fg sm:block",
            )}
          >
            {plain ? "Interactive" : "Simpler read"}
          </button>
        </div>
      </nav>
    </header>
  );
}
