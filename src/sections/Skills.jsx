import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { skillGroups, totalSkills } from "../data/skills";

/**
 * The server racks down the left wall of the room, with the same list
 * on a board hung above them. This is the readable copy of that board.
 *
 * Five groups of tags is a shape that goes flat very easily - it was
 * five identical grey blocks of five identical grey pills. What makes
 * it scannable is knowing how big each group is before reading it and
 * being able to find the edge of one, so each group is numbered, has
 * its count, and sits in its own ruled cell.
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
      <p className="-mt-4 mb-10 max-w-2xl text-fg-muted">
        {totalSkills} things across five groups, ordered within each by how much
        of the work above actually leaned on them.
      </p>

      {/* Separate cards rather than one ruled grid. Five groups in a
          three-up grid leaves a sixth cell with nothing in it, and in a
          grid held together by its own gaps that empty cell is a
          visible hole. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <section
            key={group.id}
            className="rounded-xl border border-ink-700 bg-ink-900/40 p-6"
          >
            <header className="mb-5 flex items-baseline justify-between gap-4">
              <h3 className="flex items-baseline gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                <span className="text-accent/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {group.label}
              </h3>
              <span className="font-mono text-[11px] text-fg-subtle">
                {group.items.length}
              </span>
            </header>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 font-mono text-[12px] text-fg-muted transition-colors hover:border-accent/40 hover:text-fg"
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
