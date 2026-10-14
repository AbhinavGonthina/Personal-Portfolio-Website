import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "../lib/cn";
import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";

/**
 * Three techniques, all of them transform- or opacity-only, so none of this
 * costs frames:
 *
 * 1. A single pill that slides between items, via motion's shared-layout
 *    `layoutId`. One element animates between positions rather than each
 *    item fading its own background in and out. This is the whole trick -
 *    it reads as expensive and is almost free.
 * 2. The pill rests on whichever section you are actually looking at, and
 *    follows the pointer on hover. Tracked with an IntersectionObserver, not
 *    a scroll handler, so nothing runs per frame.
 * 3. The bar is bare at the top of the page and condenses into a bordered,
 *    blurred strip once you scroll. Driven by one boolean that flips at a
 *    threshold, so it re-renders twice per page, not continuously.
 */

const SECTIONS = [...NAV_ITEMS.map((i) => i.id), "connect"];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);

  // One boolean, flipped at a threshold - not a value bound to scroll
  // position, which would re-render on every frame of every scroll.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    // A band across the middle of the viewport: whichever section crosses it
    // is the one being read. Cheaper and steadier than measuring offsets.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

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
      {/* Hairline that brightens toward the middle. Fades in with the bar, so
          the edge reads as lit rather than ruled. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group mr-auto flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="size-1.5 rounded-full bg-fg transition-transform duration-300 group-hover:scale-150" />
          {profile.name}
        </button>

        <div
          className="relative hidden items-center md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onFocus={() => setHovered(item.id)}
              className={cn(
                "relative px-3.5 py-2 text-sm transition-colors duration-200",
                marked === item.id ? "text-fg" : "text-fg-muted",
              )}
            >
              {marked === item.id && (
                <motion.span
                  layoutId="nav-pill"
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-ink-800"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTo("connect")}
          className="ml-4 rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-ink-950 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          Contact
        </button>
      </nav>
    </header>
  );
}
