import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { skillGroups } from "../data/skills";

/**
 * The racks in the workshop. One rack per group in the scene; the
 * actual list lives here, because a label painted on a server is not
 * something anyone should have to read.
 */
export default function Skills({ ref }) {
  const plain = usePlain();

  return (
    <Stop id="skills" title="Skills" plain={plain} refEl={ref}>
      <div
        className={
          plain
            ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-6"
        }
      >
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
