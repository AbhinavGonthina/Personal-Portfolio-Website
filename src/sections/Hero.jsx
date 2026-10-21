import { useEffect, useState } from "react";
import TiltCard from "../components/TiltCard";
import { usePlain } from "../lib/plain";
import { profile, RESUME_URL, socials } from "../data/profile";
import { education } from "../data/about";

/**
 * The establishing shot: the whole town in one frame, with nothing on
 * it but a name.
 *
 * Who I am, what I do and what I am working on used to live here as a
 * floating block. They have moved onto the hoarding in the scene,
 * which is the next stop - a sign you walk up to and read, rather than
 * a caption hanging over the view of the town.
 *
 * Narrow screens and the plain read get the flat layout instead: no
 * canvas mounts at all, so the photo and the copy come back as DOM.
 *
 * In that read this block is also the About section, and carries its
 * id. There is no point in a page that introduces him twice - a photo,
 * a tagline and a "currently" line at the top, then the same photo,
 * the same tagline and the same line again one screen down under a
 * heading that says "Who I am". What About had that this did not was
 * the education, so the education moved up here and the section went.
 */

const BTN =
  "rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/** The four facts a recruiter checks first, in one line of mono. */
const FACTS = [
  ["School", `${education.school} · ${education.degree}`],
  ["Graduating", `${education.graduation} · GPA ${education.gpa}`],
  ["Honors", education.honors],
  ["Focus", profile.focus.join(" · ")],
];

function Actions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => scrollTo("experience")}
        className={`${BTN} bg-fg text-ink-950 hover:opacity-90`}
      >
        View my work
      </button>
      <a
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN} border border-ink-600 text-fg hover:border-fg-subtle hover:bg-ink-800`}
      >
        Résumé
      </a>
      {/* The two that are worth a click from the first screen. The
          rest of the contact details are their own section. */}
      <span aria-hidden className="mx-1 h-5 w-px bg-ink-700" />
      {socials
        .filter((s) => s.icon === "github" || s.icon === "linkedin")
        .map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle transition-colors hover:text-fg"
          >
            {s.name}
          </a>
        ))}
    </div>
  );
}

export default function Hero({ ref }) {
  const plain = usePlain();
  const [narrow, setNarrow] = useState(null);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const flat = narrow || plain;

  // --- phones, and anyone who asked for the plain read ------------------
  if (flat) {
    return (
      <section
        ref={ref}
        id="about"
        className="pointer-events-auto relative w-full scroll-mt-20"
      >
        {/* A single soft wash behind the first screen, so the page does
            not open on flat black. It is one gradient on one element
            and it is the only decoration above the fold. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_80%_at_18%_0%,rgba(111,227,245,0.10),transparent_70%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-24 sm:pt-28">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[1fr_300px]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent/80">
                {profile.role}
                <span className="mx-2 text-fg-subtle">/</span>
                <span className="text-fg-subtle">{profile.location}</span>
              </p>

              <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
                {profile.name}
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-fg-muted">
                {profile.tagline}
              </p>

              {/* The live dot is the one animated thing on the page.
                  It is here because this line is the only one whose
                  whole point is that it is true today. */}
              <p className="mt-7 inline-flex items-center gap-3 rounded-full border border-ink-700 bg-ink-900/70 py-2 pl-3 pr-5 text-sm text-fg-muted">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/70" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                {profile.currently}
              </p>

              <div className="mt-9">
                <Actions />
              </div>
            </div>

            <TiltCard className="order-first mx-auto w-full max-w-[260px] md:order-none md:ml-auto md:mr-0">
              <div className="relative rounded-xl border border-white/10 bg-ink-950 p-1.5 [transform:translateZ(0px)]">
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={896}
                  height={896}
                  className="w-full rounded-lg [transform:translateZ(22px)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-1.5 rounded-lg ring-1 ring-inset ring-white/15 [transform:translateZ(34px)]"
                />
              </div>
            </TiltCard>
          </div>

          {/* The facts that used to be a definition list in a section of
              their own, as a rule-separated strip. Four short things
              read faster across than down. */}
          <dl className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map(([k, v]) => (
              <div key={k} className="bg-ink-950 px-5 py-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                  {k}
                </dt>
                <dd className="mt-2 text-sm leading-snug text-fg-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  // `null` means the media query has not resolved. Render the shell
  // only, so a phone never briefly mounts a canvas it throws away.
  if (narrow === null) {
    return <section ref={ref} className="h-[94vh] min-h-[620px]" />;
  }

  // The name is extruded lettering standing on the pavement in the
  // scene, and the hoarding two stops down says the rest. Nothing is
  // left to put over the top of the town except the word for where
  // you are.
  return (
    <section
      ref={ref}
      className="pointer-events-none relative h-[94vh] min-h-[620px] w-full"
    >
      <h1 className="sr-only">
        {profile.name} &mdash; {profile.role}
      </h1>
    </section>
  );
}
