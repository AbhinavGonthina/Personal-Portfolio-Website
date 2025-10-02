import AboutSection from "../sections/AboutSection";
import WelcomeSection from "../sections/WelcomeSection";
import SectionDivider from "../utilities/SectionDivider";
import SkillsSection from "../sections/SkillsSection";
import ExperienceSection from "../sections/ExperienceSection";

export default function Layout() {
  return (
    <div className="flex flex-col items-center justify-center">
      <WelcomeSection />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <div className="h-[100vh]">Current border of page</div>
    </div>
  );
}
