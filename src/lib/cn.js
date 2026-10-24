import { clsx } from "clsx";

/**
 * Join class names.
 *
 * Components copied from Aceternity UI, Magic UI and React Bits
 * import this by convention, usually from "@/lib/utils". Keep the
 * named export stable.
 *
 * This used to be `twMerge(clsx(...))`, which is what those
 * registries ship, so that a later Tailwind utility would beat an
 * earlier one in the same group - `cn("p-2", "p-4")` giving `p-4`
 * rather than both. That is the right default for a component
 * library whose callers are strangers, and it was 27KB of the
 * entry bundle here.
 *
 * It was also, measurably, doing nothing. Instrumenting this
 * function to record every call where `twMerge` changed the
 * result, and then walking the whole site - three widths, both
 * themes, all three reading levels, every section, every hover -
 * turned up exactly one distinct call:
 *
 *     relative h-full w-full size-full  =>  relative size-full
 *
 * which is the same box either way, because `size-full` sets the
 * two properties `h-full` and `w-full` set. Nothing else on the
 * page passes a utility that collides with one of its own
 * defaults.
 *
 * So: clsx alone. If a component is ever added whose callers do
 * need to override its utilities, bring `tailwind-merge` back -
 * the instrumentation above is three lines and worth rerunning
 * before assuming either way.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
