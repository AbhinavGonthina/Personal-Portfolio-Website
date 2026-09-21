import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";

// About is parked, not deleted — sections/About.jsx and data/about.js are intact.
export default function App() {
  return (
    <Box>
      <Navbar />
      <Box component="main">
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <Connect />
      </Box>
      <Footer />
    </Box>
  );
}
