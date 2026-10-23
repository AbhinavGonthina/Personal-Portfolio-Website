import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";
import { useNarrow, usePlain } from "../lib/plain";
import { toggleTheme, useTheme } from "../lib/theme";
import { toggleLevel, useLevel } from "../lib/readLevel";
import { useState as useLocal, useEffect as useOnce } from "react";
import Nudge from "./Nudge";
import listMark from "bootstrap-icons/icons/list.svg?raw";
import starsMark from "bootstrap-icons/icons/stars.svg?raw";
import sunMark from "bootstrap-icons/icons/sun.svg?raw";
import moonMark from "bootstrap-icons/icons/moon.svg?raw";
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

let seenOffer = false;

/** How long either prompt stays up. */
const OFFER_FOR = 5000;

const LINK =
  "relative rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200";

export default function Navbar() {
  const plain = usePlain();
  const narrow = useNarrow();
  const theme = useTheme();
  const level = useLevel();

  const switching = useSwitching();

  // Offered once a visit, the first time the written read is up,
  // and only there - in the town it would be pointing at a control
  // that is not on screen.
  //
  // `!switching` is the whole of why this works. The store flips to
  // plain half way through the run out of the town, not at the end
  // of it, so hanging the prompt off `plain` alone put it up while
  // the crane was still lifting and the five seconds were spent
  // behind a town nobody had left yet. By the time the written read
  // was on screen the prompt had already been and gone.
  //
  // `seenOffer` is a module variable rather than storage, which is
  // exactly the lifetime wanted: once per load of the page, and a
  // refresh offers it again.
  const [offer, setOffer] = useLocal(false);
  useOnce(() => {
    if (!plain || switching || seenOffer) return;
    seenOffer = true;
    setOffer(true);
  }, [plain, switching]);

  // And taken away again five seconds later, whatever put it up.
  //
  // This is a second effect rather than a timer inside the first
  // one, and the reason is the `seenOffer` guard above. React runs
  // an effect, tears it down and runs it again during development,
  // and the once-a-visit guard is deliberately not React state, so
  // it survives that: the teardown cleared the only timer and the
  // second run returned early before reaching the line that would
  // have made another. The prompt went up and stayed up. Hanging
  // the timer off the thing it is hiding cannot be orphaned that
  // way, because the second run sees the state already true and
  // schedules against it.
  useOnce(() => {
    if (!offer) return;
    const t = setTimeout(() => setOffer(false), OFFER_FOR);
    return () => clearTimeout(t);
  }, [offer]);

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

  // The bar keeps its scrolled dress through a run.
  //
  // It was taken off for the length of one, on the theory that the
  // border and the tint were what made the bar read as a band
  // ruled across the top of the framed page. They were not - the
  // band was the switch's clip-path cutting away the glow the bar
  // is supposed to sit on, and that is fixed where it lives, in
  // the clip. Taking the dress off as well only meant the bar
  // stopped being opaque, so the page ran underneath it in full
  // view and the thing it is meant to sit over came out in front
  // of it instead.
  const lit = scrolled;

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
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-(--lift-edge) to-transparent transition-opacity duration-500",
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
          className="relative flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border border-(--lift-line) bg-(--lift-fill) p-1 [-ms-overflow-style:none] [scrollbar-width:none] md:justify-self-center md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
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
                  className="absolute inset-0 -z-10 rounded-full bg-(--lift-fill-strong) ring-1 ring-inset ring-(--lift-ring)"
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
        <div className="flex items-center justify-end gap-2">
          {/* Day or night, in both readings. The icon is the one you
              are going to rather than the one you are in, which is
              how every other switch on a phone reads. */}
          {/* Between the two readable settings. Not shown in the
              town, where there is no written read to simplify, and
              never offering `raw` - that one is only ever arrived
              at by being asked twice. */}
          {plain && (
            <div className="relative">
              <button
                onClick={toggleLevel}
                aria-pressed={level === "bare"}
                aria-label={
                  level === "bare"
                    ? "Back to the full simpler read"
                    : "Strip it down to the bare minimum"
                }
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border border-(--lift-line) text-fg-subtle transition-colors",
                  "hover:border-(--lift-line-strong) hover:text-fg",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <span
                  aria-hidden
                  className="size-3.5 [&>svg]:size-full"
                  dangerouslySetInnerHTML={{
                    __html: level === "bare" ? starsMark : listMark,
                  }}
                />
              </button>
              {/* A label, not a second button. It points at the
                  control above it and that control is the only way
                  to act on it. */}
              <Nudge show={offer} at="under">
                Want it even simpler?
              </Nudge>
            </div>
          )}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full border border-(--lift-line) text-fg-subtle transition-colors",
              "hover:border-(--lift-line-strong) hover:text-fg",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            <span
              aria-hidden
              className="size-3.5 [&>svg]:size-full"
              dangerouslySetInnerHTML={{
                __html: theme === "dark" ? sunMark : moonMark,
              }}
            />
          </button>
          {!narrow && (
            <button
              onClick={() => runSwitch(!plain)}
              aria-pressed={plain}
              className={cn(
                LINK,
                "border border-(--lift-line) text-fg-subtle hover:border-(--lift-line-strong) hover:text-fg",
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
