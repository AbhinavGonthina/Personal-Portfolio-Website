import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/cn";
import { usePlain } from "../lib/plain";
import { useLevel } from "../lib/readLevel";
import Ticker from "../components/rich/Ticker";
import Glow from "../components/rich/Glow";
import { Dots, Wash } from "../components/rich/Backdrop";
import { setFocused, useFocused } from "../lib/stage";
import { useScrollLock } from "../lib/scrollLock";
import { arcOrder, experience, EXPERIENCE_GROUPS } from "../data/experience";
import PickHint from "../components/PickHint";
import { Heading } from "../components/Stop";
import Timeline from "../components/Timeline";

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

/**
 * The date range as short as it can be said.
 *
 * "Jun 2026 - Aug 2026" wraps onto two lines in the timeline's
 * rail; within one year the year only needs saying once.
 */
const span = (r) => {
  const year = (d) => d.split(" ").pop();
  if (r.end === "Present") return `${r.start} – Present`;
  if (year(r.start) === year(r.end)) {
    return `${r.start.split(" ")[0]} – ${r.end}`;
  }
  return `${r.start} – ${r.end}`;
};

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
function Detail({ role, onBack, onStep, inScene, hideDates, rich }) {
  const hasStats = role.stats?.length > 0;
  const hasTech = role.tech.length > 0;

  return (
    <>
      {inScene && <Steps role={role} onStep={onStep} onBack={onBack} />}

      <h3 className="text-2xl font-semibold tracking-tight">{role.company}</h3>
      <p className="text-fg-muted">{role.role}</p>
      <p className="mt-1 font-mono text-xs text-fg-subtle">
        {/* On the timeline the rail carries the dates, so repeating
            them here would print them twice a hand apart. */}
        {hideDates
          ? role.location
          : `${role.start} – ${role.end} · ${role.location}`}
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
        // Side by side from `lg`, not `sm`. The width this row gets
        // is the card's, not the window's, and the card is inset by
        // the timeline rail - so at 834 the stack of technologies was
        // one pill per line beside a block of figures.
        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-7">
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
                      {/* The figure arrives at itself. Most of these
                          are not numbers - "$140K", "10 -> 4",
                          "~722M" - so only the digits move and the
                          rest is left where it is. */}
                      {rich ? <Ticker value={s.value} /> : s.value}
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

  const level = useLevel();
  const rich = plain && level !== "bare";

  const current = experience.find((e) => e.id === focused) ?? null;

  // --- phones, and anyone who asked for the plain read -------------------
  if (plain) {
    return (
      <section
        ref={ref}
        id="experience"
        className="pointer-events-auto relative scroll-mt-26 pb-24 pt-4"
      >
        {rich && (
          <>
            <Dots />
            <Wash tint="var(--color-accent)" at="88% 8%" size="46% 52%" />
          </>
        )}
        <div className="relative mx-auto w-full max-w-6xl px-6">
          <Heading n={1}>Experience</Heading>

          <p className="-mt-6 mb-10 max-w-2xl text-fg-muted">
            Where I have worked, what each place actually does, and what I was
            responsible for.
          </p>

          {/* A timeline rather than eight cards that open.
              The grid fitted a screen, but reading a role meant
              clicking it and watching the other seven shift to make
              room. Down a rail nothing moves: every role is already
              open, the dates stay with you as you read, and the
              beam marks how far through you are.

              One rail per group rather than one long one. The three
              are different kinds of thing - a co-op, a startup and
              a university society are not rungs on the same ladder
              - and a single unbroken line implies they are. */}
          {EXPERIENCE_GROUPS.map((group) => {
            const roles = experience.filter((r) => r.category === group.id);
            if (!roles.length) return null;
            return (
              <section key={group.id} className="mb-16 last:mb-0">
                <h3 className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.24em] text-fg-subtle">
                  {group.label}
                  <span className="h-px flex-1 bg-ink-700" />
                  <span className="text-fg-subtle/60">{roles.length}</span>
                </h3>

                <Timeline
                  tight={rich}
                  data={roles.map((r) => ({
                    title: span(r),
                    content: (
                      <Glow
                        on={rich}
                        tint={r.accent}
                        className={`relative rounded-xl border border-ink-700 p-6 transition-colors ${
                          rich
                            ? "bg-ink-900/50 hover:border-ink-600"
                            : "bg-ink-900/40"
                        }`}
                        style={
                          rich
                            ? {
                                "--tint": r.accent,
                                // A breath of the role's colour in
                                // the corner, so a card is its own
                                // place before you have read a word
                                // of it.
                                backgroundImage: `radial-gradient(70% 120% at 0% 0%, color-mix(in oklab, ${r.accent} 13%, transparent), transparent 60%)`,
                              }
                            : undefined
                        }
                      >
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-[3px]"
                          style={{ background: r.accent }}
                        />
                        <div className="relative flex items-start gap-5">
                          <img
                            src={r.logo}
                            alt=""
                            loading="lazy"
                            width={96}
                            height={96}
                            className="hidden size-12 shrink-0 rounded-lg object-contain p-1.5 sm:block"
                            style={{ background: r.brand }}
                          />
                          <div className="min-w-0 flex-1">
                            <Detail
                              role={r}
                              inScene={false}
                              hideDates
                              rich={rich}
                            />
                          </div>
                        </div>
                      </Glow>
                    ),
                  }))}
                />
              </section>
            );
          })}
        </div>
      </section>
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
                  "linear-gradient(to right, transparent, var(--scrim-in) 26%, var(--scrim-out))",
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
