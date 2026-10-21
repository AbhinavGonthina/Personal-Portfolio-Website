import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/cn";
import { usePlain } from "../lib/plain";
import { setFocused, useFocused } from "../lib/stage";
import { useScrollLock } from "../lib/scrollLock";
import { arcOrder, experience, EXPERIENCE_GROUPS } from "../data/experience";
import PickHint from "../components/PickHint";
import { Heading } from "../components/Stop";

/**
 * Two presentations of the same state.
 *
 * On a wide screen the section is full-bleed and the skyline *is* the
 * section: click a building and the camera flies in, frames it on the left
 * and slides its detail in on the right.
 *
 * On a phone there is no skyline at all. A row of six towers spans about 17
 * world units, and a portrait viewport is half as wide as it is tall —
 * fitting that in means shrinking the buildings to specks. Rather than ship
 * a bad version of the 3D, narrow screens get the plain grouped list, which
 * also means no WebGL context, no 266 kB download, and no thumb-sized tap
 * targets.
 */

const EASE = [0.22, 1, 0.36, 1];

/** Fades the detail column's backing in from its left edge. */
/**
 * Fades the detail column's backing in. It starts 14rem to the left of the
 * column so the fade happens in the empty gutter and the copy itself sits
 * on the solid part - run inside the column instead and the first inch of
 * every line lands on half-strength scrim.
 */
const SCRIM_FADE = "linear-gradient(to right, transparent, black 26%)";

const STEP =
  "flex size-8 items-center justify-center rounded-md border border-ink-700 text-fg-muted transition-colors hover:border-ink-600 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-30 disabled:hover:border-ink-700 disabled:hover:text-fg-muted";

/**
 * Walk the skyline without going back out to it first. The arrows step
 * along `arcOrder`, which is the order the buildings actually stand in -
 * so left really is the building to the left.
 */
function Steps({ role, onStep, onBack }) {
  const i = arcOrder.findIndex((r) => r.id === role.id);
  const go = (d) => () => onStep(arcOrder[i + d].id);
  return (
    <div className="mb-6 flex items-center gap-2">
      <button
        onClick={go(-1)}
        disabled={i <= 0}
        aria-label={i > 0 ? `Previous: ${arcOrder[i - 1].company}` : "Previous"}
        className={STEP}
      >
        <span aria-hidden>&larr;</span>
      </button>
      <button
        onClick={go(1)}
        disabled={i >= arcOrder.length - 1}
        aria-label={
          i < arcOrder.length - 1 ? `Next: ${arcOrder[i + 1].company}` : "Next"
        }
        className={STEP}
      >
        <span aria-hidden>&rarr;</span>
      </button>

      <button
        onClick={onBack}
        className="ml-auto flex h-8 items-center gap-2 rounded-md border border-ink-700 px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle transition-colors hover:border-ink-600 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {/* Bordered to match the steppers beside it - as bare text it read
            as a caption rather than as the way out. */}
        <span aria-hidden>&crarr;</span>
        Back to the skyline
      </button>
    </div>
  );
}

/** A mono label over a block, the way the hoarding sets its facts. */
const Label = ({ children }) => (
  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-subtle">
    {children}
  </p>
);

/**
 * One role, in four parts: what the place is, what I did there, what
 * it was built with, and the numbers.
 *
 * The last two share a line, tech on the left and the numbers on the
 * right. They are the two parts you skim rather than read, so putting
 * them side by side at the foot keeps the prose above uninterrupted
 * and lets the eye land on either without going through the other.
 *
 * Every part except the first is dropped when it is empty. A role
 * with no numbers gets the full width for its stack, and a role with
 * nothing written yet shows its blurb and stops - an empty heading
 * over nothing reads as broken rather than as unfinished.
 */
function Detail({ role, onBack, onStep, inScene }) {
  const hasStats = role.stats?.length > 0;
  const hasTech = role.tech.length > 0;

  return (
    <>
      {inScene && <Steps role={role} onStep={onStep} onBack={onBack} />}

      <h3 className="text-2xl font-semibold tracking-tight">{role.company}</h3>
      <p className="text-fg-muted">{role.role}</p>
      <p className="mt-1 font-mono text-xs text-fg-subtle">
        {role.start} &ndash; {role.end} &middot; {role.location}
      </p>

      {/* What the place is. Set against the accent rule rather than
          as another paragraph, because it is context for everything
          under it and not the first thing I want to say. */}
      <p
        className="mt-6 border-l-2 pl-4 text-sm leading-relaxed text-fg-muted"
        style={{ borderColor: role.accent }}
      >
        {role.blurb}
      </p>

      {role.did.length > 0 && (
        <div className="mt-6">
          <Label>What I did</Label>
          {/* Paragraphs, because some of these are two things rather
              than one: Oasis is an accelerator and a project series,
              and running them together made the second read as a
              continuation of the first. */}
          <div className="space-y-3">
            {role.did.map((para) => (
              <p
                key={para.slice(0, 40)}
                className="text-sm leading-relaxed text-fg-muted"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {(hasTech || hasStats) && (
        <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
          {hasTech && (
            <div className="min-w-0 flex-1">
              <Label>Built with</Label>
              <ul className="flex flex-wrap gap-2">
                {role.tech.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-ink-700 bg-ink-900/80 px-2.5 py-1 text-xs text-fg-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasStats && (
            <div className="shrink-0">
              <Label>By the numbers</Label>
              {/* Two across, however many there are. A role with four
                  wraps into a block rather than a strip, which is what
                  lets it stand beside a long stack instead of pushing
                  the whole panel past the foot of the screen. */}
              <div className="flex max-w-[15.75rem] flex-wrap gap-3">
                {role.stats.map((s) => (
                  <div
                    key={s.label}
                    className="w-[7.5rem] rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-3"
                  >
                    <p
                      className="text-lg font-semibold leading-none tracking-tight"
                      style={{ color: role.accent }}
                    >
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-fg-subtle">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** The grouped button row. Visible on phones; the keyboard route elsewhere. */
function RoleNav({ selected, onSelect, className }) {
  return (
    <nav aria-label="Roles" className={className}>
      {EXPERIENCE_GROUPS.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-fg-subtle">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {experience
              .filter((r) => r.category === group.id)
              .map((role) => (
                <button
                  key={role.id}
                  onClick={() => onSelect(role.id)}
                  aria-pressed={role.id === selected}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    role.id === selected
                      ? "border-fg bg-fg text-ink-950"
                      : "border-ink-600 text-fg-muted hover:bg-ink-800 hover:text-fg",
                  )}
                >
                  {role.company}
                </button>
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Experience({ ref }) {
  const plain = usePlain();
  // The skyline is drawn by a canvas that lives above this component, so
  // which building is open is shared state rather than local.
  const focused = useFocused();

  // Scroll drives the camera, so scrolling while a building is open
  // would walk the shot off the thing being read about. The page is
  // pinned until you come back out.
  useScrollLock(Boolean(focused) && !plain);

  // Escape is the shortcut everyone already tries for this.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e) => e.key === "Escape" && setFocused(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  // The scene frames a focused building differently when there is no room
  // for a column beside it, and a phone gets no 3D at all.
  const [narrow, setNarrow] = useState(null);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const current = experience.find((e) => e.id === focused) ?? null;

  // --- phones, and anyone who asked for the plain read -------------------
  if (narrow || plain) {
    return (
      <section
        ref={ref}
        id="experience"
        className="pointer-events-auto scroll-mt-16 py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <Heading n={1}>Experience</Heading>

          <p className="-mt-6 mb-10 max-w-2xl text-fg-muted">
            {experience.length} roles across healthcare, travel, education and
            motorsport. Open one for what the work actually was.
          </p>

          {/* All eight on the screen at once, two across.
              Laid out full - the blurb, what I did, the stack and
              the numbers for every role - the section ran to five
              screens and you had to scroll past six jobs to find
              out there was a seventh. The card carries what you
              scan by; the rest is one click under it and costs
              nothing until it is asked for. */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {arcOrder.map((r) => (
              <details
                key={r.id}
                className="group relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40 transition-colors hover:border-ink-600 open:bg-ink-900/70"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ background: r.accent }}
                />
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4 pl-6 [&::-webkit-details-marker]:hidden">
                  <img
                    src={r.logo}
                    alt=""
                    loading="lazy"
                    width={96}
                    height={96}
                    className="size-10 shrink-0 rounded-lg object-contain p-1"
                    style={{ background: r.brand }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-semibold tracking-tight">
                        {r.company}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-fg-subtle">
                        {r.start.split(" ").pop()}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-fg-muted">
                      {r.role}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-90"
                  >
                    &rsaquo;
                  </span>
                </summary>

                <div className="border-t border-ink-800 px-6 pb-6 pt-5">
                  <Detail role={r} inScene={false} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // `null` means the media query has not resolved yet. Render the shell
  // only, so a phone never briefly mounts a WebGL context it is about to
  // throw away.
  if (narrow === null) {
    return (
      <section ref={ref} id="experience" className="h-[94vh] min-h-[620px]" />
    );
  }

  // --- wide: the skyline is the section ---------------------------------
  return (
    <section
      ref={ref}
      id="experience"
      // scroll-mt-16 so jumping here clears the sticky bar, the same
      // offset every other section gets from Section. At 92vh the whole
      // skyline still fits underneath it.
      // pointer-events-none so clicks reach the canvas behind this,
      // which is no longer a child of the section. Everything in here
      // that is meant to be clicked turns them back on.
      className="pointer-events-none relative h-[94vh] min-h-[620px] w-full scroll-mt-16"
    >
      {/* The towers are pointer-only, so this is the keyboard and
          screen-reader route to the same state. `sr-only` rather than
          `hidden`, which would take it out of the tab order; focus-within
          reveals it so a sighted keyboard user can see where they are. */}
      <RoleNav
        selected={focused}
        onSelect={setFocused}
        className="pointer-events-auto sr-only z-20 focus-within:not-sr-only focus-within:absolute focus-within:inset-x-0 focus-within:top-20 focus-within:mx-auto focus-within:flex focus-within:max-w-6xl focus-within:gap-8 focus-within:px-6"
      />

      {!plain && <PickHint />}

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.45, ease: EASE }}
            // Fixed, not absolute. Anchored to the section it moved
            // with the scroll, so where the copy landed on screen
            // depended on how far into Experience you happened to be
            // when you clicked - and since the page is pinned while a
            // building is open, there is nothing for it to track but
            // the viewport. Fixed also ignores the padding the lock
            // adds in place of the scrollbar, so the column runs to
            // the real right-hand edge instead of stopping short of
            // it in a strip of bare scene.
            className="pointer-events-auto fixed inset-y-0 right-0 z-10 flex w-[46%] items-center"
          >
            {/* Something to read against. The skyline keeps moving behind
                this column, so the copy was landing on lit windows. Two
                layers: a short blur to take the detail out of whatever is
                back there, and a cool near-black wash over it for
                contrast. Both fade in from the left so the column has no
                edge - a hard one would read as a panel bolted over the
                scene rather than as depth. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-56 right-0 backdrop-blur-[22px]"
              style={{ maskImage: SCRIM_FADE, WebkitMaskImage: SCRIM_FADE }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-56 right-0"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(6,9,18,0.94) 26%, rgba(6,9,18,0.97))",
              }}
            />

            {/* `2xl` and not `xl`, and 16 of padding rather than 24.
                On a 1366 by 700 laptop the old pair spent 192 of the
                700 on padding and then wrapped the longest stack into
                five rows inside 504 pixels, which put the tallest
                role 78 pixels past the bottom of its own column. The
                46% column clamps the width anyway, so the wider cap
                only ever helps. */}
            {/* Asymmetric on purpose. The top padding is there to
                clear the bar, which is four rems of it; the bottom
                has nothing to clear and was matching it out of
                habit, at the cost of two rems of a 700 pixel
                screen. */}
            <div className="relative max-h-full max-w-2xl overflow-y-auto px-6 pb-8 pt-16 pr-12">
              <Detail
                role={current}
                inScene
                onStep={setFocused}
                onBack={() => setFocused(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
