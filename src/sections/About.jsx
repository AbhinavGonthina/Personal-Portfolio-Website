import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { profile } from "../data/profile";
import { education } from "../data/about";

/**
 * The hoarding at the edge of town. All of this is painted on the
 * board itself in the scene, so what is here is the readable copy.
 *
 * In the plain read this section does not appear at all. Everything
 * it had - the photo, the role line, the tagline, the "currently"
 * line - was already on the screen one scroll above it, and a page
 * that introduces somebody twice reads as a page nobody edited. The
 * one thing it had that the top did not was the education, and that
 * has moved up into the hero, which also took this section's `about`
 * id so the navigation still has somewhere to go.
 *
 * The component stays, because the 3D read still needs this stop: it
 * is the camera's anchor for the hoarding and the screen-reader copy
 * of what is painted on it.
 */
export default function About({ ref }) {
  const plain = usePlain();
  if (plain) return null;

  return (
    <Stop id="about" title="Who I am" n={1} plain={false} refEl={ref}>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle">
        {profile.role} &middot; {profile.location}
      </p>
      <p className="mt-5 max-w-2xl leading-relaxed text-fg-muted">
        {profile.tagline}
      </p>
      <p className="mt-5 max-w-2xl text-sm text-fg-muted">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
          Currently
        </span>{" "}
        &middot; {profile.currently}
      </p>

      <dl className="mt-8 space-y-4">
        {[
          ["School", `${education.school} · ${education.degree}`],
          ["Graduating", education.graduation],
          ["GPA", `${education.gpa} · ${education.honors}`],
          ["Focus", profile.focus.join(" · ")],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-6">
            <dt className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
              {k}
            </dt>
            <dd className="text-sm text-fg-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </Stop>
  );
}
