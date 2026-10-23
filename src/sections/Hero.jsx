import githubMark from "bootstrap-icons/icons/github.svg?raw";
import linkedinMark from "bootstrap-icons/icons/linkedin.svg?raw";
import envelopeMark from "bootstrap-icons/icons/envelope.svg?raw";
import TiltCard from "../components/TiltCard";
import { usePlain } from "../lib/plain";
import { useLevel } from "../lib/readLevel";
import { useTheme } from "../lib/theme";
import AuroraText from "../components/rich/AuroraText";
import Ether from "../components/rich/Ether";
import { Dots } from "../components/rich/Backdrop";
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
const MARKS = {
  github: githubMark,
  linkedin: linkedinMark,
  email: envelopeMark,
};

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
            // A mailto has nowhere to open: given a new tab it
            // leaves a blank one behind after the mail client
            // takes over.
            {...(s.icon === "email"
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" })}
            aria-label={s.name}
            title={s.name}
            className="inline-flex size-10 items-center justify-center rounded-full border border-transparent text-fg-subtle transition-colors hover:border-ink-600 hover:bg-ink-800 hover:text-fg [&>svg]:size-5"
            dangerouslySetInnerHTML={{ __html: MARKS[s.icon] }}
          />
        ))}
    </div>
  );
}

/**
 * Where the fluid is allowed to be at full strength.
 *
 * `black` is full, and the grey in the middle of the second stop
 * is how much of it survives behind the reading matter. 0.3 was
 * arrived at by looking: at 0.5 the tagline was still competing
 * with a swirl, and below 0.2 there is a visible hole in the
 * colour in the shape of the text block.
 */
const HOLD = [
  "linear-gradient(to bottom, transparent, black 10%, black 66%, transparent)",
  "radial-gradient(52% 46% at 30% 52%, rgba(0,0,0,0.3), rgba(0,0,0,0.3) 35%, black 78%)",
].join(", ");

/**
 * The gradient in the first name. Four stops rather than three,
 * because this one runs rather than sits and a loop of three
 * comes back round too obviously.
 */
const NAME = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff", "#6fe3f5"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd", "#0e7f94"],
};

export default function Hero({ ref }) {
  // One question, asked once. This used to keep its own listener on
  // the width alongside `lib/plain`'s, which is how a narrow window
  // ended up showing this section plain with the town still drawn
  // behind it - the store said one thing and this said another.
  const plain = usePlain();
  const rich = useLevel() !== "bare";
  const NAME_FOR = NAME[useTheme()] ?? NAME.dark;

  // --- phones, and anyone who asked for the plain read ------------------
  if (plain) {
    return (
      <section
        ref={ref}
        id="about"
        className="pointer-events-auto relative w-full scroll-mt-20"
      >
        {/* There were two soft radial washes here, one cyan from
            the left and one violet from the right, to keep the page
            from opening on flat black. They are gone. The fluid is
            the colour on this screen now, and three blurred things
            stacked on each other is how a landing turns to fog. */}
        {rich && (
          <>
            <Dots className="opacity-40" />
            {/* The fluid, over the two washes and under everything
                that is read.

                It takes the pointer, because being pushed around is
                the whole of what it is - but only here. The layer
                stops where the first screen stops, so the rest of
                the page is nobody's but the reader's, and the
                content above it is a sibling with its own stacking
                context rather than a child, so no link or button on
                the landing is sitting on top of a canvas that
                wants the same events.

                Two masks, intersected.

                The first fades it out at the bottom, because a
                fluid that simply ends at a line draws the line and
                this one ends in the middle of a page.

                The second is the one that matters. It holds the
                fluid down to a third of itself over an ellipse
                covering the left-hand column, and lets it up to
                full everywhere else. The whole screen was at a flat
                45 per cent before, which is the blunt way to keep a
                paragraph readable: it costs the colour everywhere,
                including the two thirds of the screen with nothing
                written on it. Dimming it only where there are words
                means the name, the tagline and the buttons sit
                clear of it and the rest of the frame can be as
                strong as it likes. */}
            <div
              aria-hidden
              className="pointer-events-auto absolute inset-x-0 -top-20 -z-10 h-[760px] opacity-80"
              style={{
                maskImage: HOLD,
                WebkitMaskImage: HOLD,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              <Ether />
            </div>
          </>
        )}

        {/* The same gap above the content as below it. It was 112
            over and 80 under, which is close enough to look like a
            mistake rather than a choice. */}
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-28">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_340px] md:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent/80">
                {profile.role}
                <span className="mx-2 text-fg-subtle">/</span>
                <span className="text-fg-subtle">{profile.location}</span>
              </p>

              {/* The one piece of colour on the page that is not
                  behind something. The surname keeps the page's own
                  ink, so the gradient reads as an accent on a name
                  rather than as a name made of gradient. */}
              <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
                {rich ? (
                  <>
                    <AuroraText colors={NAME_FOR} speed={0.8}>
                      {profile.name.split(" ")[0]}
                    </AuroraText>{" "}
                    {profile.name.split(" ").slice(1).join(" ")}
                  </>
                ) : (
                  profile.name
                )}
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
              <div className="relative overflow-hidden rounded-2xl border border-(--lift-line) bg-ink-950 [transform:translateZ(0px)]">
                <img
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={896}
                  height={896}
                  className="block w-full [transform:translateZ(18px)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-(--lift-line)"
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
        {profile.name}, {profile.role}
      </h1>
    </section>
  );
}
