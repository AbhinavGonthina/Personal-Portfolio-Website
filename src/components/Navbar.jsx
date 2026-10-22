import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";
import { useNarrow, usePlain } from "../lib/plain";
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
  //
  // Through `NAV_FOR`, not by matching ids: a nav item is named for
  // the section it scrolls to and a stop is named for the place it
  // looks at, and for Contact those are different words - the
  // section is "connect" and the stop is "contact". Comparing them
  // directly found nothing, handed the camera a null, and the skip
  // this is here to arm never armed.
  const to = STOPS.findIndex((s) => NAV_FOR[s.id] === id);
  beginJump(2500, to < 0 ? null : to);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

/**
 * Which nav item a camera stop belongs to. The landing belongs to
 * none of them.
 */
const NAV_FOR = {
  about: "about",
  experience: "experience",
  skills: "skills",
  projects: "projects",
  contact: "connect",
};

const LINK =
  "relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200";

export default function Navbar() {
  const plain = usePlain();
  const narrow = useNarrow();
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

  // The bar wears its scrolled dress only when it is a bar.
  //
  // Past 24 pixels it takes a border, a tinted background and a
  // hairline, which is what makes a sticky bar read as chrome over
  // a page. Inside the switch's frame it is not over anything: the
  // page is shrunk into a rectangle and the bar is shrunk with it,
  // so that treatment stops reading as chrome and starts reading
  // as a band ruled across the top of the picture. The reader has
  // usually scrolled by the time they click, so this was on for
  // most of every run home.
  const lit = scrolled && !switching;

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
        lit
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
          lit ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Three columns rather than a flex row, so the links sit on the
          centre of the page whatever the name on the left or the button on
          the right happen to be. */}
      <nav
        // Three columns rather than a flex row so the links sit on the
        // centre of the page whatever is beside them - but the centre
        // column has to be allowed to shrink below its content on a
        // phone, or it pushes the bar wider than the window.
        className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center px-6 md:grid-cols-[1fr_auto_1fr]"
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
          aria-label="Back to top"
        >
          <span className="size-1.5 rounded-full bg-fg transition-transform duration-300 group-hover:scale-150" />
          {/* The dot alone on a phone. The name is the first thing in
              the page underneath it, and the 130 pixels it takes here
              are 130 the links do not have. */}
          <span className="hidden sm:inline">{profile.name}</span>
        </button>

        {/* Shown at every width now.
            It was `hidden md:flex`, which took the only navigation
            off the one reading a phone is ever given - five long
            sections and nothing to do but scroll. The five do not fit
            across 390 pixels, so below `md` the row scrolls sideways
            instead of disappearing; the scrollbar itself is taken
            away because the bar is 56 pixels tall and a scrollbar in
            it is furniture, not information. */}
        <div
          className="relative flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] md:justify-self-center md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
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
                "shrink-0",
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

        {/* The way out for anyone who would rather just read the thing.
            Gone below the width the town is built at, because there
            the plain read is the only reading there is and the other
            button is a button to nothing. Asked of the store rather
            than written as a breakpoint, so the control and the thing
            it controls cannot be given two different thresholds. */}
        <div className="flex justify-end">
          {!narrow && (
            <button
              onClick={() => runSwitch(!plain)}
              aria-pressed={plain}
              className={cn(
                LINK,
                "border border-white/10 text-fg-subtle hover:border-white/20 hover:text-fg",
              )}
            >
              {plain ? "Interactive" : "Simpler read"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
