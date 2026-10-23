import { useEffect } from "react";
import { setLevel } from "../lib/readLevel";
import { profile, socials } from "../data/profile";
import { bio, education } from "../data/about";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";
import { skillGroups, skillDetail } from "../data/skills";
import { projects } from "../data/projects";

/**
 * The document with the design taken off it.
 *
 * Not a minimal theme - there is no theme. Every stylesheet on the
 * page is switched off, so what a reader gets is the browser's own
 * defaults: Times, blue underlined links, a bulleted list. It is a
 * joke, but it is an honest one, because this is genuinely what is
 * underneath. Everything on the page is still here and still in
 * order, which is the point worth making.
 *
 * Nothing in this file carries a class. Adding one would be
 * pointless with the stylesheets off and misleading with them on.
 */
function disableStyles(off) {
  const sheets = document.querySelectorAll(
    'style, link[rel="stylesheet"], link[rel="preload"][as="style"]',
  );
  for (const el of sheets) {
    // Vite injects styles as <style> in dev and links a file in a
    // build; both answer to `disabled`, and both come back.
    if (off) {
      if (el.dataset.rawWas === undefined) {
        el.dataset.rawWas = el.disabled ? "1" : "0";
      }
      el.disabled = true;
    } else if (el.dataset.rawWas !== undefined) {
      el.disabled = el.dataset.rawWas === "1";
      delete el.dataset.rawWas;
    }
  }
}

export default function RawRead() {
  useEffect(() => {
    disableStyles(true);
    // New stylesheets can still arrive while this is up - a hot
    // reload in development inserts one per edit - so the switch
    // is reapplied whenever the head changes.
    const watch = new MutationObserver(() => disableStyles(true));
    watch.observe(document.head, { childList: true });
    return () => {
      watch.disconnect();
      disableStyles(false);
    };
  }, []);

  return (
    <div>
      <p>
        <em>This is what you asked for :)</em>
      </p>
      <p>
        <button onClick={() => setLevel("rich")}>Put the design back</button>
      </p>

      <hr />

      <h1>{profile.name}</h1>
      <p>
        {profile.role} &middot; {profile.location}
      </p>
      <p>{profile.currently}</p>
      <ul>
        {socials.map((s) => (
          <li key={s.name}>
            <a href={s.href}>
              {s.name}: {s.value}
            </a>
          </li>
        ))}
      </ul>

      <h2>About</h2>
      {bio.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      <p>
        {education.school}, {education.degree}. Graduating{" "}
        {education.graduation}. GPA {education.gpa}.
      </p>

      <h2>Experience</h2>
      {EXPERIENCE_GROUPS.map((group) => (
        <div key={group.id}>
          <h3>{group.label}</h3>
          {experience
            .filter((r) => r.category === group.id)
            .map((r) => (
              <div key={r.id}>
                <h4>
                  {r.company} &mdash; {r.role}
                </h4>
                <p>
                  <small>
                    {r.start} to {r.end} &middot; {r.location}
                  </small>
                </p>
                <p>
                  <em>{r.blurb}</em>
                </p>
                {r.did.map((d) => (
                  <p key={d.slice(0, 40)}>{d}</p>
                ))}
                {r.tech?.length > 0 && <p>Built with: {r.tech.join(", ")}</p>}
                {r.stats?.length > 0 && (
                  <ul>
                    {r.stats.map((s) => (
                      <li key={s.label}>
                        {s.value} {s.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      ))}

      <h2>Skills</h2>
      {skillGroups.map((g) => (
        <div key={g.id}>
          <h3>{g.label}</h3>
          <dl>
            {g.items.map((item) => (
              <div key={item}>
                <dt>{item}</dt>
                <dd>
                  {skillDetail[item]?.use}
                  {skillDetail[item]?.proof?.length > 0 && (
                    <ul>
                      {skillDetail[item].proof.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <h2>Projects</h2>
      {projects.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>
            <small>{p.period}</small>
          </p>
          <p>{p.description ?? p.blurb}</p>
          {p.tech?.length > 0 && <p>Built with: {p.tech.join(", ")}</p>}
          <p>
            {p.live && <a href={p.live}>Live site</a>}
            {p.live && p.github && " · "}
            {p.github && <a href={p.github}>Source</a>}
            {p.private && <em>Private repository</em>}
          </p>
        </div>
      ))}

      <h2>Contact</h2>
      <ul>
        {socials.map((s) => (
          <li key={s.name}>
            <a href={s.href}>
              {s.name}: {s.value}
            </a>
          </li>
        ))}
      </ul>

      <hr />
      <p>
        <button onClick={() => setLevel("rich")}>Put the design back</button>
      </p>
      <p>
        <small>
          &copy; {new Date().getFullYear()} {profile.name}
        </small>
      </p>
    </div>
  );
}
