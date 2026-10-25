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
import starsMark from "bootstrap-icons/icons/stars.svg?raw";
import StarsOff from "./StarsOff";
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
  // No hit-area expansion here, and that is deliberate rather than
  // an oversight. These carried `tap-y`, which made them 44 tall
  // inside a 29 tall row - and a row that scrolls sideways cannot
  // have anything sticking out of it vertically without becoming
  // scrollable vertically too. The row now clips that axis, so an
  // expanded target would only be clipped back. At 29 by 70-to-112
  // they are well over the 24 pixels WCAG asks for and the
  // generous dimension is the one your thumb is moving along.
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

  // Keep the lit link where it can be seen.
  //
  // Below `md` the five links do not fit across the bar, so the row
  // scrolls sideways. That is fine while you are driving it and
  // wrong while the page is: scrolling into Projects lit a pill two
  // items off the right-hand edge, so a phone showed a bar with
  // nothing marked on it and no sign that there was more of it.
  //
  // `nearest` rather than `center`: the first and last items should
  // sit against their own ends of the row rather than being dragged
  // into the middle with empty track beside them. And only the row
  // moves - `block: "nearest"` on an element already in view is a
  // no-op vertically, which matters because this fires while the
  // page is scrolling and must not fight it.
  const rail = useRef(null);

  // Fade an end only when that end has something behind it.
  //
  // Measured on a phone, the row at rest had fourteen pixels of
  // fade sitting over "About" - the link the page lands on and
  // lights - with nothing scrolled off to its left for the fade to
  // be about. A gradient that says "there is more this way" when
  // there is not is just a dimmed word.
  //
  // Reads two numbers off an element that is already being
  // scrolled, so there is no measuring here that the browser was
  // not doing anyway, and it only runs while the row is moving.
  useEffect(() => {
    const row = rail.current;
    if (!row) return;
    const FADE = "0.9rem";
    const look = () => {
      const more = row.scrollWidth - row.clientWidth;
      row.style.setProperty("--nav-fade-l", row.scrollLeft > 2 ? FADE : "0px");
      row.style.setProperty(
        "--nav-fade-r",
        row.scrollLeft < more - 2 ? FADE : "0px",
      );
    };
    look();
    row.addEventListener("scroll", look, { passive: true });
    const ro = new ResizeObserver(look);
    ro.observe(row);
    return () => {
      row.removeEventListener("scroll", look);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const row = rail.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const lit = row.querySelector('[data-nav-active="true"]');
    lit?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [active]);

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
        // Two columns below `sm`, three above it.
        //
        // The back-to-top dot is `hidden` on a phone, and `hidden`
        // is `display: none`, which takes an element out of the
        // grid rather than emptying its cell. With three columns
        // declared and two items left, the pill fell into the
        // `auto` column and sized itself to its content - 449
        // pixels of links on a 390 pixel screen - and the two
        // buttons went into the `1fr` beside it, on top of it.
        className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center px-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[1fr_auto_1fr]"
        // The bar itself runs to the edge of the window. Its contents
        // stand off the gap the scroll lock leaves where the scrollbar
        // was, so opening a building does not nudge everything in here
        // half a scrollbar to the right.
        style={{ paddingRight: "calc(1.5rem + var(--lock-gap, 0px))" }}
      >
        {/* Gone below `sm`, not just the name.
            The name was already hidden there, which left a six
            pixel dot taking a column of its own and about fourteen
            pixels of bar - on a 390 screen those pixels are worth
            more to the links, which do not fit. Everything this
            did is still reachable: About is the first link in the
            row and lands a hair below the top. */}
        <button
          onClick={() => {
            setFocused(null);
            // The same announcement every other link on this page
            // makes, and the one control that was not making it.
            //
            // `beginJump` is how a deliberate move tells the stage
            // to stand aside: without it this scroll was treated as
            // if the reader had flicked the page, so the arrival
            // pin dragged it back to the stop it had just left and
            // the trip to the top only happened once the pin ran
            // out. The landing is stop zero, which is a real
            // destination and not `null` - the camera wants to know
            // where it is being sent before the scroll gets
            // anywhere near it.
            beginJump(2500, 0);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="tap group hidden w-fit items-center gap-2 text-sm font-semibold tracking-tight sm:flex"
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
        {/* Two elements, not one.
            The pill - border, fill, padding - holds still, and only
            the track of links inside it scrolls. They were the same
            element, and the feather that tells a phone there is more
            of the row to push was then eating the pill's own rounded
            cap along with the word at the edge, so the bar looked
            like a box with two sides missing. */}
        <div
          // `px-2`, not `p-1`. Four pixels put the lit lozenge all but
          // touching the pill's own border, which reads as a
          // rendering fault rather than a nested shape. Eight gives
          // it somewhere to sit; the vertical stays at four so the
          // bar does not grow.
          className="relative min-w-0 rounded-full border border-(--lift-line) bg-(--lift-fill) px-2 py-1 md:justify-self-center"
          onMouseLeave={() => setHovered(null)}
        >
          <div
            ref={rail}
            // `nav-rail` feathers both ends below `md`, where the row
            // scrolls sideways. Hidden overflow cuts the word at the
            // edge clean in half, and on a 390px screen the result
            // was a bar reading "ABOUT EXPERIENCE SKILL" with the
            // theme button sitting on the broken letter - which looks
            // like a layout fault rather than something you can push.
            // The same feather every backdrop here wears says "there
            // is more of this" instead. See index.css; the mask is
            // dropped above `md`, where everything fits and a
            // composited layer buys nothing.
            className="nav-rail flex items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onFocus={() => setHovered(item.id)}
                aria-current={active === item.id ? "true" : undefined}
                data-nav-active={active === item.id ? "true" : undefined}
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
              at by being asked twice.

              The sparkle, and the sparkle struck through. One
              mark in two states, because the two readings are
              one page with the decoration on or off and the
              control should say exactly that. Arrows were here
              briefly and were right about direction and silent
              about what is at either end of them. */}
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
                  "tap [--tap-w:36px] sm:[--tap-w:40px] grid size-7 shrink-0 place-items-center rounded-full border border-(--lift-line) text-fg-subtle transition-colors sm:size-8",
                  "hover:border-(--lift-line-strong) hover:text-fg",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                {level === "bare" ? (
                  <span
                    aria-hidden
                    className="size-3.5 [&>svg]:size-full"
                    dangerouslySetInnerHTML={{ __html: starsMark }}
                  />
                ) : (
                  <StarsOff className="size-3.5" />
                )}
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
              "tap [--tap-w:36px] sm:[--tap-w:40px] grid size-7 shrink-0 place-items-center rounded-full border border-(--lift-line) text-fg-subtle transition-colors sm:size-8",
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
