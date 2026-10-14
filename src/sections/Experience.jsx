import { useState } from "react";
import Section from "../components/Section";
import { cn } from "../lib/cn";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";

/**
 * Grouped tab row over a detail panel. The grouping (work / startup /
 * Northeastern) lives in the data and says something the dates do not - a
 * co-op, a startup tech-lead role and a teaching assistantship are not
 * comparable entries in one flat list.
 */
export default function Experience() {
  const [selected, setSelected] = useState(experience[0].id);
  const current = experience.find((e) => e.id === selected) ?? experience[0];

  return (
    <Section id="experience" title="Where I've worked">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:gap-10">
        {EXPERIENCE_GROUPS.map((group) => (
          <div key={group.id}>
            <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-fg-subtle">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {experience
                .filter((e) => e.category === group.id)
                .map((exp) => {
                  const active = exp.id === current.id;
                  return (
                    <button
                      key={exp.id}
                      onClick={() => setSelected(exp.id)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "border-fg bg-fg text-ink-950"
                          : "border-ink-600 text-fg-muted hover:border-ink-600 hover:bg-ink-800 hover:text-fg",
                      )}
                    >
                      {exp.company}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h3 className="text-xl font-semibold">{current.company}</h3>
        <p className="text-fg-muted">{current.role}</p>
        <p className="mt-1 font-mono text-xs text-fg-subtle">
          {current.start} – {current.end} &middot; {current.location}
        </p>

        <ul className="mt-5 space-y-3">
          {current.bullets.map((b) => (
            <li
              key={b.slice(0, 40)}
              className="flex gap-3 text-sm leading-relaxed text-fg-muted"
            >
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-subtle"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {current.tech.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {current.tech.map((t) => (
              <li
                key={t}
                className="rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1 text-xs text-fg-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
