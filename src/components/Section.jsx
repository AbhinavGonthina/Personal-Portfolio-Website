import { cn } from "../lib/cn";

/**
 * Every section goes through here. It owns the scroll anchor, the page width
 * and the heading - nothing else. Sections describe content only.
 *
 * `max-w-6xl` is the one shared measurement on the site; the navbar uses the
 * same, which is what keeps every heading and the logo on one left edge.
 */
export default function Section({ id, title, className, children }) {
  return (
    <section id={id} className={cn("scroll-mt-16 py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-6">
        {title && (
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            {/* Short rule under every heading, the same one the Experience
                section carries. It is what stops a heading floating on a
                black page with nothing holding it down. */}
            <div className="mt-3 h-px w-16 bg-fg" />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
