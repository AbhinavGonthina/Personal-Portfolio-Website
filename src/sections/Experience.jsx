import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../lib/cn";
import { usePlain } from "../lib/plain";
import { setFocused, useFocused } from "../lib/stage";
import { arcOrder, experience, EXPERIENCE_GROUPS } from "../data/experience";

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

function Detail({ role, onBack, onStep, inScene }) {
  return (
    <>
      {inScene && <Steps role={role} onStep={onStep} onBack={onBack} />}

      <h3 className="text-2xl font-semibold tracking-tight">{role.company}</h3>
      <p className="text-fg-muted">{role.role}</p>
      <p className="mt-1 font-mono text-xs text-fg-subtle">
        {role.start} &ndash; {role.end} &middot; {role.location}
      </p>

      <ul className="mt-6 space-y-3">
        {role.bullets.map((b) => (
          <li
            key={b.slice(0, 40)}
            className="flex gap-3 text-sm leading-relaxed text-fg-muted"
          >
            <span
              aria-hidden
              className="mt-2 size-1.5 shrink-0 rounded-full"
              style={{ background: role.accent }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {role.tech.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {role.tech.map((t) => (
            <li
              key={t}
              className="rounded-md border border-ink-700 bg-ink-900/80 px-2.5 py-1 text-xs text-fg-muted"
            >
              {t}
            </li>
          ))}
        </ul>
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
    const shown = current ?? experience[0];
    return (
      <section
        ref={ref}
        id="experience"
        className="pointer-events-auto scroll-mt-16 py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Experience
            </h2>
            <div className="mt-3 h-px w-16 bg-fg" />
          </div>
          <RoleNav
            selected={shown.id}
            onSelect={setFocused}
            className="mb-8 flex flex-col gap-6"
          />
          <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
            <Detail role={shown} inScene={false} />
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
      <section ref={ref} id="experience" className="h-[92vh] min-h-[620px]" />
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
      className="pointer-events-none relative h-[92vh] min-h-[620px] w-full scroll-mt-16"
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-6xl px-6 pt-20">
        <h2 className="relative w-fit text-3xl font-semibold tracking-tight">
          {/* Only once a building is focused. In the skyline view the
              camera keeps the sky behind the heading clear, but flying in
              brings a lit facade up behind it. */}
          <span
            aria-hidden
            className="absolute -inset-x-8 -inset-y-6 -z-10 rounded-full transition-opacity duration-500"
            style={{
              opacity: focused ? 1 : 0,
              background:
                "radial-gradient(60% 70% at 40% 50%, rgba(7,10,20,0.92), transparent 75%)",
            }}
          />
          Experience
        </h2>
        {/* Short rule under the heading - against a black skyline the
            title otherwise floats with nothing holding it to the page. */}
        <div className="mt-3 h-px w-16 bg-fg" />
      </div>

      <AnimatePresence>
        {!focused && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle"
          >
            <span>Click a building to read about the experience</span>
            {/* From the pavement you cannot see the whole block at once, so
                say plainly that there is more either side. */}
            <span className="flex items-center gap-2 opacity-70">
              <span aria-hidden>&larr;</span>
              Move your cursor to look around
              <span aria-hidden>&rarr;</span>
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto absolute inset-y-0 right-0 z-10 flex w-[46%] items-center"
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

            <div className="relative max-h-full max-w-xl overflow-y-auto px-6 py-24 pr-12">
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
