import Section from "../components/Section";
import { socials } from "../data/profile";

/** Four plain buttons. This is the end of the page; there is no footer. */
export default function Connect() {
  return (
    <Section id="connect" title="Let's talk">
      <div className="flex flex-wrap gap-3">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            {...(s.icon === "email"
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
            className="rounded-md border border-ink-600 px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {s.name}
          </a>
        ))}
      </div>
    </Section>
  );
}
