import { ChevronDown } from "lucide-react";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Reveal } from "@/src/landing/components/Reveal";
import { PixelSparkle } from "@/src/landing/components/icons";
import { HeroTombstones } from "@/src/landing/components/HeroTombstones";
import { SleepingCat } from "@/src/landing/components/SleepingCat";
import { HeroStatsBar } from "@/src/landing/components/HeroStatsBar";
import { scrollToId } from "@/src/landing/lib/scroll";
import type { DemoProjectExtra } from "@/src/landing/data/demoProjects";

interface HeroProps {
  onEnterGraveyard: () => void;
  onSelectProject: (projectId: string) => void;
  projects?: DemoProjectExtra[];
  restingCount?: number;
  reviveCount?: number;
  newIdeasCount?: number;
}

/**
 * Faithfully recreates the opening scene of the video reference:
 * - Twilight sky, mountains, sunset, cherry blossom tree, glowing lanterns
 * - Oversized pixel headline: "YOUR IDEAS / AREN'T DEAD."
 * - Retro golden button: "ENTER THE GRAVEYARD →"
 * - Sleeping white cat on the left rock with gentle breathing
 * - Four physical pixel tombstones in the grass foreground
 * - Dark purple bottom statistics bar
 */
export function HeroSection({
  onEnterGraveyard,
  onSelectProject,
  projects,
  restingCount,
  reviveCount,
  newIdeasCount,
}: HeroProps) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative z-10 flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[88px] sm:pt-[96px] pb-6 sm:pb-8"
    >
      {/* Subtle twilight scrim behind the hero text to ensure 100% crisp readability over the video */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-[65%] w-full sm:w-[58%] md:w-[50%] bg-gradient-to-r from-navy/90 via-navy/60 to-transparent z-0"
      />

      {/* Top Hero Headline Block */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1400px]">
        <div className="max-w-[36rem] pt-3 sm:pt-6">
          <Reveal delay={0.05}>
            <p className="inline-flex items-center gap-2 font-pixel text-[9px] sm:text-[10px] uppercase tracking-widest text-gold">
              <PixelSparkle size={12} /> THE PROJECT GRAVEYARD
            </p>
          </Reveal>

          {/* Oversized Headline with pixel sparks */}
          <Reveal as="h1" delay={0.12} className="relative mt-3 sm:mt-4">
            <div className="relative inline-block">
              <span
                id="hero-title"
                className="block font-pixel text-[clamp(1.75rem,4.2vw,3.6rem)] uppercase leading-[1.25] text-cream px-text-shadow"
              >
                YOUR IDEAS
                <br />
                AREN'T <span className="text-lavender">DEAD.</span>
              </span>

              {/* Pixel yellow spark accents '\ ' top-right of IDEAS matching video */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 sm:-top-2 right-4 sm:-right-8 animate-pulse text-gold"
              >
                <svg width="22" height="22" viewBox="0 0 12 12" shapeRendering="crispEdges">
                  <rect x="2" y="2" width="2" height="2" fill="#FFC857" />
                  <rect x="5" y="0" width="2" height="2" fill="#FFC857" />
                  <rect x="9" y="3" width="2" height="2" fill="#FFC857" />
                  <rect x="7" y="6" width="2" height="2" fill="#FFC857" />
                </svg>
              </div>
            </div>
          </Reveal>

          {/* Subtitle */}
          <Reveal as="p" delay={0.22} className="mt-3 sm:mt-4 text-[clamp(1.05rem,1.8vw,1.35rem)] font-bold leading-snug text-soft [text-shadow:0_2px_0_rgba(23,24,62,.9)]">
            They're just waiting for their next chapter.
          </Reveal>

          <Reveal as="p" delay={0.3} className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-[#ECE8FF] [text-shadow:0_1px_0_rgba(23,24,62,.9)] max-w-[32rem]">
            Every unfinished project has value. Step into the graveyard to inspect what was built, diagnose why it stopped, and decide what rises next.
          </Reveal>

          {/* Golden Retro CTA Button */}
          <Reveal delay={0.38} className="mt-5 sm:mt-6 flex flex-wrap items-center gap-4">
            <PixelButton
              variant="gold"
              size="lg"
              accent="arrow"
              onClick={onEnterGraveyard}
              aria-label="Enter the Graveyard"
              className="px-btn-gold shadow-[0_6px_0_0_#0D0E2B]"
            >
              ENTER THE GRAVEYARD →
            </PixelButton>

            <PixelButton
              variant="ghost"
              size="md"
              accent="sparkle"
              onClick={() => scrollToId("graveyard")}
            >
              How It Works
            </PixelButton>
          </Reveal>
        </div>
      </div>

      {/* Middle/Lower Meadow Foreground: Sleeping Cat + 4 Tombstones */}
      <div className="relative z-10 mt-6 sm:mt-10 w-full">
        <div className="mx-auto flex w-[94%] max-w-[1400px] flex-col lg:flex-row items-end justify-between gap-6">
          {/* Sleeping Cat resting on the left rock */}
          <div className="hidden sm:block shrink-0 pb-2 pl-2">
            <Reveal delay={0.45}>
              <SleepingCat />
            </Reveal>
          </div>

          {/* Four physical landscape tombstones */}
          <div className="w-full flex-1">
            <HeroTombstones
              projects={projects}
              onSelectProject={onSelectProject}
            />
          </div>
        </div>
      </div>

      {/* Bottom Area: Statistics Panel + Scroll indicator */}
      <div className="relative z-10 mt-6 sm:mt-8 w-full flex flex-col items-center gap-3">
        <Reveal delay={0.52} className="w-full">
          <HeroStatsBar
            restingCount={restingCount}
            reviveCount={reviveCount}
            newIdeasCount={newIdeasCount}
          />
        </Reveal>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={() => scrollToId("graveyard")}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold hover:text-cream transition-colors duration-150 py-1"
          aria-label="Scroll down to the Graveyard"
        >
          <span>Scroll</span>
          <ChevronDown size={16} strokeWidth={3} className="sprite-hop" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
