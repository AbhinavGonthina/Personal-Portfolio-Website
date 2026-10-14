import Section from "../components/Section";
import { skillGroups } from "../data/skills";

/** One block per domain, every skill shown. Nothing is behind a toggle. */
export default function Skills() {
  return (
    <Section id="skills" title="What I work with">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.id}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-fg-subtle">
              {group.label}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1 text-sm text-fg-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
