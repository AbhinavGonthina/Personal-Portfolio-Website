import AboutSection from "../sections/AboutSection";
import WelcomeSection from "../sections/WelcomeSection";
import SkillsSection from "../sections/SkillsSection";
import ExperienceSection from "../sections/ExperienceSection";
import ProjectsSection from "../sections/ProjectsSection";
import ConnectSection from "../sections/ConnectSection";
import Footer from "../sections/Footer";

export default function Layout() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* All the sections of the portfolio */}
      <WelcomeSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ConnectSection />
      <Footer />
    </div>
  );
}
