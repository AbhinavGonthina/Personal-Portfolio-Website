import AboutSection from "../sections/AboutSection";
import WelcomeSection from "../sections/WelcomeSection";
import SectionDivider from "../utilities/SectionDivider";

export default function Layout() {
  return (
    <div>
      <WelcomeSection />
      <SectionDivider />
      <AboutSection />
      <SectionDivider />
      <div className="h-[100vh]">Current border of page</div>
    </div>
  );
}
