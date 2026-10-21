import { useEffect, useState } from "react";
import githubMark from "bootstrap-icons/icons/github.svg?raw";
import linkedinMark from "bootstrap-icons/icons/linkedin.svg?raw";
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

/**
 * One height for everything in the action row.
 *
 * Padding alone does not give you that. The outlined button carries
 * a border and the filled one did not, so the same `py` came out two
 * pixels taller on one than the other, and the icon links were four
 * shorter again. A fixed height and a transparent border on the
 * ones that do not want a visible one makes all of them the same
 * box, whatever is inside it.
 */
const BTN =
  "inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/**
 * What the photo stands on.
 *
 * Four, because four fit on one line and five did not - the honours
 * programme wrapped the row onto a second line for one more fact,
 * and a rule with a ragged two-line row under it is a worse trade
 * than leaving the fact out. Not "focus" either: those four
 * technologies are already named on half the roles below and on
 * every tag in the skills board.
 */
const EDUCATION = [
  ["School", education.school],
  ["Degree", education.degree],
  ["Graduating", education.graduation],
  ["GPA", education.gpa],
];

/** Bootstrap's marks, which are already a dependency for the mailboxes. */
const MARKS = { github: githubMark, linkedin: linkedinMark };

function Actions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => scrollTo("experience")}
        className={`${BTN} border-transparent bg-fg text-ink-950 hover:opacity-90`}
      >
        View my work
      </button>
      <a
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN} border-ink-600 text-fg hover:border-fg-subtle hover:bg-ink-800`}
      >
        Résumé
      </a>
      {/* The two that are worth a click from the first screen. The
          rest of the contact details are their own section.

          As marks rather than as the words GITHUB and LINKEDIN: both
          logos are recognised faster than either word is read, and
          two more pieces of tracked mono capitals beside two buttons
          made the row look like four buttons of unequal weight. */}
      <span aria-hidden className="mx-1 h-6 w-px bg-ink-700" />
      {socials
        .filter((s) => MARKS[s.icon])
        .map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            title={s.name}
            className="inline-flex size-10 items-center justify-center rounded-full border border-transparent text-fg-subtle transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-fg [&>svg]:size-5"
            dangerouslySetInnerHTML={{ __html: MARKS[s.icon] }}
          />
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
            not open on flat black.

            It starts above this section, not at the top of it. The
            bar is sticky, so it takes the first four rem of the page
            and the section begins underneath - and a gradient that
            begins where the section begins gets cut off square along
            that line, which drew the outline of the bar in light. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-20 h-[620px] bg-[radial-gradient(58%_78%_at_18%_12%,rgba(111,227,245,0.11),transparent_70%)]"
        />

        {/* The same gap above the content as below it. It was 112
            over and 80 under, which is close enough to look like a
            mistake rather than a choice. */}
        <div className="relative mx-auto w-full max-w-6xl px-6 py-28">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_340px] md:gap-16">
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

            <TiltCard className="order-first mx-auto w-full max-w-[340px] md:order-none md:ml-auto md:mr-0">
              {/* The picture fills its frame. It used to sit inside
                    a padded box with a second rounded ring drawn in
                    the gap, which left a hairline of background
                    showing all the way round it. */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950 [transform:translateZ(0px)]">
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={896}
                  height={896}
                  className="block w-full [transform:translateZ(18px)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
                />
              </div>
            </TiltCard>
          </div>

          {/* Below the grid, not inside it.
              Anything in the left cell is part of what the photo is
              centred against, so with this row in there the photo
              was levelling itself against copy-plus-education and
              sitting low of the copy. Out here it is under
              everything and the photo lines up with the block it
              belongs to. Held to the width of the column above it
              so the row does not run out under the picture. */}
          <dl className="mt-10 flex max-w-[700px] flex-wrap items-baseline gap-x-7 gap-y-3 border-t border-ink-800 pt-7">
            {EDUCATION.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
                  {k}
                </dt>
                <dd className="text-xs text-fg-muted">{v}</dd>
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
