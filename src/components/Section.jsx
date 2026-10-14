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
          <h2 className="mb-8 text-3xl font-semibold tracking-tight">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
