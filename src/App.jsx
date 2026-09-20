import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Connect from "./sections/Connect";

export default function App() {
  return (
    <Box>
      <Navbar />
      <Box component="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Connect />
      </Box>
      <Footer />
    </Box>
  );
}
