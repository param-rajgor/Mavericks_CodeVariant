import { useMemo } from "react";
import { Header } from "@/src/landing/components/Header";
import { GhostCursor } from "@/src/landing/components/GhostCursor";
import { CompactBackground } from "@/src/landing/components/CompactBackground";
import { landingStats, pickTombs, STATUS_PILL, type Tomb } from "@/src/landing/data/tombs";
import { useMediaQuery } from "@/src/landing/hooks/useMediaQuery";
import { FeatureScenes } from "@/src/landing/sections/FeatureScenes";
import { HeroSection } from "@/src/landing/sections/HeroSection";
import { PixelFooter } from "@/src/landing/sections/PixelFooter";
import { HeroStage } from "@/src/landing/stage/HeroStage";
import { navigate } from "@/src/lib/router";
import { useProjects } from "@/src/store/ProjectsContext";

/** Compact layouts get big, tappable tombstones instead of the artwork's baked-in ones. */
function CompactTombs({ tombs, onOpen }: { tombs: Tomb[]; onOpen: (href: string) => void }) {
  return (
    <section aria-label="Your project graveyard" className="relative z-10 mx-auto -mt-16 w-[90%] max-w-[640px] pb-10">
      <ul className="grid grid-cols-2 gap-4">
        {tombs.map((t) => {
          const pill = STATUS_PILL[t.status];
          return (
            <li key={t.key}>
              <button
                type="button"
                onClick={() => onOpen(t.href)}
                className="tomb-outer relative block w-full bg-[#2c2570] p-[4px] text-left"
                aria-label={`${t.name}. ${t.status}. Open project.`}
              >
                <span className="tomb-inner tomb-stone relative flex min-h-[150px] flex-col items-center justify-end gap-2 px-3 pb-4 pt-8 text-center">
                  <span className="text-[15px] font-extrabold leading-tight text-soft [overflow-wrap:anywhere]">{t.name}</span>
                  <span className="border-2 border-navy px-2 py-1 font-mono text-[11px] font-bold uppercase" style={{ background: pill.bg, color: pill.fg }}>
                    {t.status}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The scroll-video landing page. On wide screens the video's own composition is the hero, with real
 * elements placed over it. On narrow screens the landscape is recomposed around readable DOM text.
 */
export function LandingPage() {
  const { projects } = useProjects();
  const wide = useMediaQuery("(min-aspect-ratio: 3/2) and (min-width: 900px)");
  const tombs = useMemo(() => pickTombs(projects), [projects]);
  const stats = useMemo(() => landingStats(projects), [projects]);
  const enter = () => navigate("/app");
  const open = (href: string) => navigate(href);

  return (
    <div className="landing-root min-h-screen bg-navy text-soft">
      {wide ? (
        <HeroStage tombs={tombs} stats={stats} onOpen={open} onEnter={enter} />
      ) : (
        <>
          <CompactBackground />
          <Header onGetStarted={enter} />
        </>
      )}
      <GhostCursor />
      <main id="main" className={wide ? "pointer-events-none" : undefined}>
        {wide ? <section id="top" aria-hidden="true" className="min-h-[100svh]" /> : <HeroSection onGetStarted={enter} />}
        {!wide && <CompactTombs tombs={tombs} onOpen={open} />}
        <FeatureScenes onGetStarted={enter} />
      </main>
      <PixelFooter />
    </div>
  );
}
