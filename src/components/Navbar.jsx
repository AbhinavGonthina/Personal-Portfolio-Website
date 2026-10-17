import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";
import { usePlain } from "../lib/plain";
import { runSwitch, useSwitching } from "../lib/switchView";
import { setFocused, useStopIndex } from "../lib/stage";
import { beginJump } from "../lib/scrollLock";
import { STOPS } from "../lib/stops";

/**
 * Dressed to match the skyline below it: small mono capitals with wide
 * tracking, the same type the buildings carry on their facades, and the
 * links gathered into one lit capsule the way a badge sits inside its
 * bezel. Everything that moves is transform or opacity only.
 *
 * 1. A single pill slides between items via motion's shared-layout
 *    `layoutId`, rather than each item fading its own background. This is
 *    the whole trick - it reads as expensive and is almost free.
 * 2. The pill rests on whichever stop the camera is at, and follows the
 *    pointer on hover.
 * 3. The bar is bare at the top of the page and condenses into a bordered,
 *    blurred strip once you scroll - one boolean flipped at a threshold.
 */

const scrollTo = (id) => {
  // A focused building pins the page, so a nav link would do nothing
  // until you closed it by hand. Leaving is part of going somewhere.
  setFocused(null);
  // The stop the link is for, so the camera can tell where it is
  // being sent before the scroll has got anywhere near it.
  const to = STOPS.findIndex((s) => s.id === id);
  beginJump(2500, to < 0 ? null : to);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

/**
 * Which nav item a camera stop belongs to. Two stops share Projects -
 * the camera holds still across that section while the screen on the
 * desk changes - and the landing belongs to none of them.
 */
const NAV_FOR = {
  about: "about",
  experience: "experience",
  skills: "skills",
  projects: "projects",
  "projects-hold": "projects",
  contact: "connect",
};

const LINK =
  "relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200";

export default function Navbar() {
  const plain = usePlain();
  const switching = useSwitching();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);

  // One boolean, flipped at a threshold - not a value bound to scroll
  // position, which would re-render on every frame of every scroll.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Which stop the camera is at, taken from the camera rather than
  // measured again here.
  //
  // This used to read the section rects against a line a quarter of
  // the way down the viewport, which is a second opinion about where
  // you are - and a second opinion disagrees. Click a link and scroll
  // away before the smooth scroll finishes, or flick hard enough that
  // the stage pulls the page back, and the highlight was describing a
  // section the scene had already left. There is one number for where
  // you are in this town; the bar reads that one.
  //
  // The plain read has no camera, so there it goes back to measuring
  // the sections - which is sound, because with nothing else moving
  // there is no second opinion left to disagree with.
  const stop = useStopIndex();
  const sections = useRef([]);
  const [measured, setMeasured] = useState(null);

  useEffect(() => {
    if (!plain) return;
    sections.current = NAV_ITEMS.map(({ id }) => [
      id,
      document.getElementById(id),
    ]).filter(([, el]) => el);
  }, [plain]);

  useMotionValueEvent(scrollY, "change", () => {
    if (!plain) return;
    // A line a quarter of the way down the viewport: the section
    // crossing it is the one being read.
    const line = window.innerHeight * 0.25;
    let current = null;
    for (const [id, el] of sections.current) {
      if (el.getBoundingClientRect().top <= line) current = id;
    }
    // The last section is short and sits at the end of the document,
    // so its top can never reach the line. At the bottom you are
    // looking at it whatever the maths say.
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
      current = sections.current.at(-1)?.[0] ?? current;
    }
    setMeasured((prev) => (prev === current ? prev : current));
  });

  const active = plain
    ? measured
    : (NAV_FOR[STOPS[Math.min(STOPS.length - 1, Math.max(0, stop))]?.id] ??
      null);

  const marked = hovered ?? active;

  return (
    <header
      className={cn(
        // sw-pane: the bar is part of the page, so while the switch
        // is running it rides inside the second frame rather than
        // sitting over the whole window at full size. Only while it
        // is running, though - a sticky bar is already its own layer
        // and does not need a transform on it the rest of the time.
        "sticky top-0 z-50 transition-colors duration-300",
        switching && "sw-pane",
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
      <nav
        className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6"
        // The bar itself runs to the edge of the window. Its contents
        // stand off the gap the scroll lock leaves where the scrollbar
        // was, so opening a building does not nudge everything in here
        // half a scrollbar to the right.
        style={{ paddingRight: "calc(1.5rem + var(--lock-gap, 0px))" }}
      >
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
            onClick={() => runSwitch(!plain)}
            aria-pressed={plain}
            className={cn(
              LINK,
              // Shown from the same width the town is built at.
              // Below it the plain read is the only version there is,
              // so a switch to the other one is a switch to nothing.
              "hidden border border-white/10 text-fg-subtle hover:border-white/20 hover:text-fg md:block",
            )}
          >
            {plain ? "Interactive" : "Simpler read"}
          </button>
        </div>
      </nav>
    </header>
  );
}
