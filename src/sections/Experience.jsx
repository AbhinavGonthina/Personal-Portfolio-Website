import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SceneSlot from "../components/SceneSlot";
import { cn } from "../lib/cn";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";

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

function Detail({ role, onBack, inScene }) {
  return (
    <>
      {inScene && (
        <button
          onClick={onBack}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle transition-colors hover:text-fg"
        >
          &larr; Back to the skyline
        </button>
      )}

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

export default function Experience() {
  const [focused, setFocused] = useState(null);

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

  // --- phones: no 3D at all ---------------------------------------------
  if (narrow) {
    const shown = current ?? experience[0];
    return (
      <section id="experience" className="scroll-mt-16 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight">
            Where I&apos;ve worked
          </h2>
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
    return <section id="experience" className="h-[92vh] min-h-[620px]" />;
  }

  // --- wide: the skyline is the section ---------------------------------
  return (
    <section
      id="experience"
      className="relative h-[92vh] min-h-[620px] w-full overflow-hidden bg-black"
    >
      <SceneSlot
        load={() => import("../scenes/TowersScene")}
        focused={focused}
        onFocus={setFocused}
        narrow={false}
      />

      {/* The towers are pointer-only, so this is the keyboard and
          screen-reader route to the same state. `sr-only` rather than
          `hidden`, which would take it out of the tab order; focus-within
          reveals it so a sighted keyboard user can see where they are. */}
      <RoleNav
        selected={focused}
        onSelect={setFocused}
        className="sr-only z-20 focus-within:not-sr-only focus-within:absolute focus-within:inset-x-0 focus-within:top-20 focus-within:mx-auto focus-within:flex focus-within:max-w-6xl focus-within:gap-8 focus-within:px-6"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-6xl px-6 pt-20">
        <h2 className="text-3xl font-semibold tracking-tight">
          Where I&apos;ve worked
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
            className="absolute inset-y-0 right-0 z-10 flex w-[46%] items-center"
          >
            <div className="max-h-full max-w-xl overflow-y-auto px-6 py-24 pr-12">
              <Detail role={current} inScene onBack={() => setFocused(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
