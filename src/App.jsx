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
import { usePlain } from "./lib/plain";
import { useReady } from "./lib/ready";
import { useThemeBusy } from "./lib/theme";

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
  // Waiting on the town: the canvas is meant to be showing something
  // and has not drawn yet. On a cold load that is a black screen,
  // and on the way back from the plain read it is the plain read
  // sitting there looking like nothing was clicked.
  const plain = usePlain();
  const drawn = useReady();
  // Changing the palette rebuilds the town's geometry and repaints
  // every texture in it, which blocks the main thread for long
  // enough to look broken. The store holds that work back by one
  // frame so this can be on screen before it starts.
  const repainting = useThemeBusy();
  const waiting = repainting || (!drawn && (!plain || switching));

  const hero = useRef(null);
  const about = useRef(null);
  const experience = useRef(null);
  const skills = useRef(null);
  const projects = useRef(null);
  const connect = useRef(null);
  const refs = [hero, about, experience, skills, projects, connect];

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

      {/* Something to look at while the town is being built. The gap
          between the canvas mounting and the first frame it draws is
          long enough to sit through, and on the way back from the
          plain read there is nothing on screen to say anything is
          happening at all - the page you just asked to leave is
          still sitting there. It waits on the scene's own report, so
          it goes when there is a picture rather than when React
          thinks there should be. */}
      {waiting && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-30 grid place-items-center"
        >
          <span className="sr-only">
            {repainting ? "Changing theme" : "Loading"}
          </span>
          <span className="size-9 animate-spin rounded-full border-2 border-ink-700 border-t-fg-muted" />
        </div>
      )}

      {/* The canvas is behind the page, so the wrapper has to let clicks
          through to it. Each section turns them back on. */}
      <main
        // A little under the last section, and no more.
        //
        // There were 208 pixels here, so that a nav link to Contact
        // could park its heading 112 below the bar like every other
        // section's. Contact is four buttons and two lines now, and
        // reserving most of a screen underneath it to make one
        // scroll land tidily meant the document ended in a third of
        // a screen of nothing that everybody scrolls through and
        // nobody asked for. The link now runs the page to its foot
        // and leaves Contact sitting in the lower half of the
        // window, which is where the last thing on a page belongs.
        //
        // 24 in the plain read, which is what the copyright line
        // has above it between the rule and the words, so it sits
        // in the same air on both sides instead of on a shelf.
        //
        // The town keeps the 208 it always had. Nothing about that
        // reading changed; its last section is a whole viewport and
        // the camera has to be able to reach the far end of it.
        className={`pointer-events-none relative z-10 ${plain ? "pb-6" : "pb-52"} ${switching ? "sw-pane" : ""}`}
      >
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
