import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { profile } from "../data/profile";
import { education } from "../data/about";

/**
 * The hoarding at the edge of town. All of this is painted on the
 * board itself in the scene, so what is here is the readable copy.
 */
export default function About({ ref }) {
  const plain = usePlain();

  return (
    <Stop id="about" title="Who I am" plain={plain} refEl={ref}>
      {plain && (
        <img
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          width={820}
          height={820}
          className="mb-8 w-full max-w-[280px] rounded-lg border border-ink-700"
        />
      )}

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
        &mdash; {profile.currently}
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
