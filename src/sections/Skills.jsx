import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { useLevel } from "../lib/readLevel";
import { useTheme } from "../lib/theme";
import { VelocityRow, VelocityRows } from "../components/rich/Velocity";
import Glow from "../components/rich/Glow";
import { Dots } from "../components/rich/Backdrop";
import Grid from "../components/rich/Grid";
import { skillGroups, skillDetail } from "../data/skills";

/**
 * The server racks down the left wall of the room, with the same list
 * on a board hung above them. This is the readable copy of that board.
 *
 * Rows, not cards, in the bare read. Five boxes in a three-up grid is
 * two rows and a hole, and no arrangement of five into columns comes
 * out even - the shape was always going to look like it had been left
 * halfway. A row per group, with the name in a column down the left
 * and the tags filling the rest, has no leftovers in it, reads in one
 * pass, and fits on a screen with room underneath.
 *
 * The rich read keeps that reading and gives it something to sit in.
 * Thirty-two tags laid out as five quiet rows is the sparsest thing
 * on the page - most of the section is the gap between a group's name
 * and its tags. So the groups become cards that carry their own
 * colour, and the tags run twice across the top as a band of
 * movement, which is the one place on this site where the technology
 * list looks like a technology list rather than a table of contents.
 */

/**
 * One colour per group. Not decoration: it is the thing that makes
 * a tag in the drifting band readable as belonging to a group, with
 * nothing but its border saying so.
 */
const TINT = {
  dark: {
    languages: "#6fe3f5",
    cloud: "#ffb86b",
    backend: "#8fa8ff",
    frontend: "#b48bff",
    data: "#6bd99a",
  },
  // The same five hues brought down until they are colours on
  // white rather than lights in the dark. A tag set in the night
  // cyan on a white card is a tag nobody can read.
  light: {
    languages: "#0e7f94",
    cloud: "#a0621a",
    backend: "#3b55b8",
    frontend: "#6a3fbd",
    data: "#1d7a4c",
  },
};

/**
 * The order and the width of each card, which is not the order the
 * data is in.
 *
 * Five groups into three columns does not divide, and laying them
 * out by how many tags each holds left two holes. Pairing each wide
 * group with a narrow one and giving the last the full width comes
 * out at exactly three rows with nothing missing.
 */
const BENTO = [
  ["languages", "lg:col-span-2"],
  ["backend", "lg:col-span-1"],
  ["cloud", "lg:col-span-2"],
  ["frontend", "lg:col-span-1"],
  ["data", "lg:col-span-3"],
];

const groupOf = {};
for (const g of skillGroups) for (const i of g.items) groupOf[i] = g.id;

function Tag({ item, tint, big }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-md border bg-ink-900/60 font-mono text-fg-muted ${
        big ? "px-3 py-1.5 text-[12px]" : "px-2.5 py-1 text-[11px]"
      }`}
      style={{
        borderColor: `color-mix(in oklab, ${tint} 38%, transparent)`,
        color: `color-mix(in oklab, ${tint} 78%, var(--color-fg))`,
      }}
    >
      {item}
    </span>
  );
}

export default function Skills({ ref }) {
  const plain = usePlain();
  const level = useLevel();
  const tints = TINT[useTheme()] ?? TINT.dark;

  if (!plain) {
    return (
      <Stop id="skills" title="Skills" n={2} plain={false} refEl={ref}>
        <div className="space-y-6">
          {skillGroups.map((group) => (
            <div key={group.id}>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-fg-subtle">
                {group.label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-ink-700 bg-ink-900/70 px-2.5 py-1 text-sm text-fg-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Stop>
    );
  }

  /* ------------------------------------------------ the bare read */
  if (level === "bare") {
    return (
      <Stop id="skills" title="Skills" n={2} plain refEl={ref}>
        <p className="-mt-6 mb-10 max-w-2xl text-fg-muted">
          The technologies I have used across my projects and the roles above.
        </p>

        <div className="divide-y divide-ink-800 border-y border-ink-800">
          {skillGroups.map((group, i) => (
            <section
              key={group.id}
              className="grid grid-cols-1 gap-x-8 gap-y-4 py-6 md:grid-cols-[200px_1fr] md:items-baseline"
            >
              <h3 className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                <span className="text-accent/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {group.label}
                <span className="ml-auto hidden text-fg-subtle md:inline">
                  {group.items.length}
                </span>
              </h3>

              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-ink-700 bg-ink-900/60 px-2.5 py-1.5 font-mono text-[12px] text-fg-muted transition-colors duration-200 hover:border-accent/40 hover:text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Stop>
    );
  }

  /* ------------------------------------------------ the rich read */
  // Split so the two bands are different lengths as well as
  // different directions; two identical rows passing each other
  // reads as one object, not as a drift.
  const all = skillGroups.flatMap((g) => g.items);
  const top = all.filter((_, i) => i % 2 === 0);
  const bottom = all.filter((_, i) => i % 2 === 1);

  return (
    <Stop id="skills" title="Skills" n={2} plain refEl={ref}>
      <p className="-mt-6 max-w-2xl text-fg-muted">
        The technologies I have used across my projects and the roles above.
      </p>

      {/* The whole list, twice, drifting. It is the same thirty-two
          tags the cards below hold - said once as movement and once
          as a reference, because the first is what the section looks
          like and the second is what it is for. */}
      <VelocityRows className="mt-9 space-y-3">
        <VelocityRow baseVelocity={2.2}>
          <div className="flex items-center gap-3 pr-3">
            {top.map((item) => (
              <Tag key={item} item={item} tint={tints[groupOf[item]]} big />
            ))}
          </div>
        </VelocityRow>
        <VelocityRow baseVelocity={2.8} direction={-1}>
          <div className="flex items-center gap-3 pr-3">
            {bottom.map((item) => (
              <Tag key={item} item={item} tint={tints[groupOf[item]]} big />
            ))}
          </div>
        </VelocityRow>
      </VelocityRows>

      <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Grid size={52} cells={11} opacity={0.46} seed="skills" />
        <Dots />
        {BENTO.map(([id, span]) => {
          const group = skillGroups.find((g) => g.id === id);
          const tint = tints[id];
          return (
            <div key={id} className={span}>
              <Glow
                tint={tint}
                className="h-full rounded-2xl border border-ink-700 bg-ink-900/40 p-5 transition-colors hover:border-ink-600"
              >
                <h3 className="relative flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                  <span style={{ color: tint }}>
                    {String(skillGroups.indexOf(group) + 1).padStart(2, "0")}
                  </span>
                  {group.label}
                  <span className="ml-auto text-fg-subtle">
                    {group.items.length}
                  </span>
                </h3>

                <ul className="relative mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} title={skillDetail[item]?.use}>
                      <Tag item={item} tint={tint} />
                    </li>
                  ))}
                </ul>
              </Glow>
            </div>
          );
        })}
      </div>
    </Stop>
  );
}
