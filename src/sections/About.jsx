import Stop from "../components/Stop";
import { usePlain } from "../lib/plain";
import { profile } from "../data/profile";
import { education } from "../data/about";

/**
 * The hoarding at the edge of town, with who I am beside it.
 *
 * The portrait is on the board in the scene, so this section is the
 * part that has to be selectable and readable by a crawler. On the
 * plain read the photo comes back into the DOM.
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

      <p className="mt-5 leading-relaxed text-fg-muted">{profile.tagline}</p>

      <dl className="mt-8 space-y-4">
        {[
          ["School", `${education.school} \u00b7 ${education.degree}`],
          ["Graduating", education.graduation],
          ["GPA", `${education.gpa} \u00b7 ${education.honors}`],
          ["Focus", profile.focus.join(" \u00b7 ")],
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
