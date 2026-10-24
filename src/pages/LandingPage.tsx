import { Header } from "@/src/landing/components/Header";
import { ScrollVideoBackground } from "@/src/landing/components/ScrollVideoBackground";
import { FeatureScenes } from "@/src/landing/sections/FeatureScenes";
import { HeroSection } from "@/src/landing/sections/HeroSection";
import { PixelFooter } from "@/src/landing/sections/PixelFooter";
import { navigate } from "@/src/lib/router";

/**
 * Marketing page only. It shows the key points over a clear, scroll-driven video and
 * never exposes any project data. The app opens only through "Get started".
 */
export function LandingPage() {
  const enter = () => navigate("/app");

  return (
    <div className="landing-root min-h-screen bg-navy text-soft">
      <ScrollVideoBackground />
      <Header onGetStarted={enter} />
      <main id="main">
        <HeroSection onGetStarted={enter} />
        <FeatureScenes onGetStarted={enter} />
      </main>
      <PixelFooter />
    </div>
  );
}
