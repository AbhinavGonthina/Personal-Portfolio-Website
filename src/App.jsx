import { useRef } from "react";
import Navbar from "./components/Navbar";
import ScrollHint from "./components/ScrollHint";
import SectionTitle from "./components/SectionTitle";
import TownStage from "./components/TownStage";
import FourthWall from "./components/FourthWall";
import { PAGE, useWall } from "./lib/fourthWall";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";

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
  const wall = useWall();
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
      <FourthWall />
      {/* The canvas is behind the page, so the wrapper has to let clicks
          through to it. Each section turns them back on. */}
      {/* While the sequence is playing the page is what is on the
          tablet, so it does not appear until the tablet has the
          screen. */}
      <main
        className="pointer-events-none relative z-10"
        style={wall > 0 && wall < 1 ? { opacity: PAGE(wall) } : undefined}
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
