import { useRef } from "react";
import Navbar from "./components/Navbar";
import TownStage from "./components/TownStage";
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
 * The order here is the order in `lib/stops.js`. They have to match.
 */
export default function App() {
  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const [hero, about, experience, skills, projects, connect] = refs;

  return (
    <>
      <Navbar />
      <TownStage refs={refs} />
      {/* The canvas is behind the page, so the wrapper has to let clicks
          through to it. Each section turns them back on. */}
      <main className="pointer-events-none relative z-10">
        <Hero ref={hero} />
        <About ref={about} />
        <Experience ref={experience} />
        <Skills ref={skills} />
        <Projects ref={projects} />
        <Connect ref={connect} />
      </main>
    </>
  );
}
