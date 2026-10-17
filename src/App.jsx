import { useRef } from "react";
import Navbar from "./components/Navbar";
import ScrollHint from "./components/ScrollHint";
import SectionTitle from "./components/SectionTitle";
import TownStage from "./components/TownStage";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";
import { useSwitching } from "./lib/switchView";

/**
 * The page is a walk through one town, and these are its stops in
 * order. The canvas that draws it lives above every section and is
 * handed their elements, because where the scroll sits between two
 * section tops is where the camera sits between two stops.
 *
 * Projects contributes two markers rather than one: the camera holds
 * still across that section while the screen on the desk changes, so
 * the list can be scrolled through without the shot moving.
 *
 * This order has to match `lib/stops.js`.
 */
export default function App() {
  // The switch's transform and clip live on the page itself, and a
  // transform on a document-tall element costs something even at
  // identity: it makes the page its own layer and takes the browser
  // off the scrolling fast path. So the classes that carry them go
  // on only while a run is in flight, and at rest the page is as
  // plain as it was before the transition existed. Two renders a
  // switch is the whole price.
  const switching = useSwitching();

  const hero = useRef(null);
  const about = useRef(null);
  const experience = useRef(null);
  const skills = useRef(null);
  const projects = useRef(null);
  const projectsHold = useRef(null);
  const connect = useRef(null);
  const refs = [
    hero,
    about,
    experience,
    skills,
    projects,
    projectsHold,
    connect,
  ];

  return (
    <>
      <Navbar />
      <TownStage refs={refs} />
      <SectionTitle />
      <ScrollHint />
      {/* What the town goes out behind on the way to the plain read.
          Mounted only for the run - a full-screen fixed layer that
          is transparent the rest of the time is still a layer the
          compositor carries on every scroll. */}
      {switching && (
        <div
          aria-hidden
          className="sw-veil sw-pane pointer-events-none fixed inset-0 z-[5] bg-ink-950"
        />
      )}

      {/* The canvas is behind the page, so the wrapper has to let clicks
          through to it. Each section turns them back on. */}
      <main
        className={`pointer-events-none relative z-10${switching ? " sw-pane" : ""}`}
      >
        <Hero ref={hero} />
        <About ref={about} />
        <Experience ref={experience} />
        <Skills ref={skills} />
        <Projects ref={projects} markRef={projectsHold} />
        <Connect ref={connect} />
      </main>
    </>
  );
}
