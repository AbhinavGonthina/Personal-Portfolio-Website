import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { skillGroups, totalSkills } from "../data/skills";

/**
 * The server racks down the left wall of the room, with the same list
 * on a board hung above them. This is the readable copy of that board.
 *
 * Rows, not cards. Five boxes in a three-up grid is two rows and a
 * hole, and no arrangement of five into columns comes out even - the
 * shape was always going to look like it had been left halfway. A row
 * per group, with the name in a column down the left and the tags
 * filling the rest, has no leftovers in it, reads in one pass, and
 * fits on a screen with room underneath.
 */
export default function Skills({ ref }) {
  const plain = usePlain();

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

  return (
    <Stop id="skills" title="Skills" n={2} plain refEl={ref}>
      <p className="-mt-6 mb-10 max-w-2xl text-fg-muted">
        The {totalSkills} technologies I have used across the projects below and
        the roles above, ordered within each group by how much of that work
        actually leaned on them.
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
