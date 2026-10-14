import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, with later Tailwind utilities winning over earlier ones
 * in the same group - so `cn("p-2", "p-4")` gives `p-4` rather than both.
 *
 * Components copied from Aceternity UI, Magic UI and friends import this by
 * convention, usually from "@/lib/utils". Keep the named export stable.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
