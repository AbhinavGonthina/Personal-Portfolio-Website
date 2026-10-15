import { useRef } from "react";
import Navbar from "./components/Navbar";
import StreetStage from "./components/StreetStage";
import Hero from "./sections/Hero";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";

// About has no section of its own; data/about.js still feeds the hero's
// graduation and GPA line.
export default function App() {
  // The landing section and the Experience section are two points on one
  // road, so the canvas that draws it lives above both of them and is
  // told where each one starts and stops.
  const hero = useRef(null);
  const experience = useRef(null);

  return (
    <>
      <Navbar />
      <StreetStage from={hero} to={experience} />
      {/* The canvas is behind the page, so the wrapper has to let
          clicks through to it. Each section turns them back on. */}
      <main className="pointer-events-none relative z-10">
        <Hero ref={hero} />
        <Experience ref={experience} />
        <Skills />
        <Projects />
        <Connect />
      </main>
    </>
  );
}
