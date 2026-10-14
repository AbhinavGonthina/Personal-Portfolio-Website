import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";

// About has no section of its own; data/about.js still feeds the hero's
// graduation and GPA line.
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <Connect />
      </main>
    </>
  );
}
