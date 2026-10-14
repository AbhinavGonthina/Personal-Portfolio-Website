import { profile, RESUME_URL } from "../data/profile";
import { education } from "../data/about";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const BTN =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Hero() {
  return (
    <section className="py-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          <p className="mt-3 text-lg text-fg-muted">
            {profile.role} &middot; {profile.location}
          </p>
          <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
            {profile.tagline}
          </p>
          <p className="mt-6 font-mono text-xs tracking-wide text-fg-subtle">
            Graduating {education.graduation} &middot; GPA {education.gpa}{" "}
            &middot; {education.honors}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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
              className={`${BTN} border border-ink-600 text-fg hover:bg-ink-800`}
            >
              Resume
            </a>
            <a href="/legacy/" className={`${BTN} text-fg-muted hover:text-fg`}>
              Legacy site
            </a>
            <a
              href="/prototype/"
              className={`${BTN} text-fg-muted hover:text-fg`}
            >
              Prototype
            </a>
          </div>
        </div>

        {/* Portrait right on desktop, above the copy on a phone - the
            arrangement the previous design settled on. */}
        <img
          src={profile.photo}
          alt={`Portrait of ${profile.name}`}
          width={820}
          height={820}
          className="order-first w-full max-w-[320px] justify-self-center rounded-lg border border-ink-700 md:order-none md:justify-self-end"
        />
      </div>
    </section>
  );
}
