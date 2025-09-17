import WelcomeSection from "../sections/WelcomeSection";

export default function Layout() {
  return (
    <div>
      <WelcomeSection />
      <div className="h-[100vh]">Current border of page</div>
    </div>
  );
}
