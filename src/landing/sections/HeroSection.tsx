import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Reveal } from "@/src/landing/components/Reveal";
import { PixelSparkle } from "@/src/landing/components/icons";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";
import { scrollToId } from "@/src/landing/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The supplied video already contains the hero copy, nav and stats (AI-rendered, with typos).
 * ScrollVideoBackground lays feathered "mist" panels over those regions so the crisp,
 * real HTML here replaces them and the page reads as one world.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = content.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -48,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 35%", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative z-10 min-h-[100svh] overflow-hidden">
      {/* mobile scrim so copy stays readable over the tree */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/55 to-transparent md:hidden" />
      <div ref={content} className="relative mx-auto flex min-h-[100svh] w-[90%] max-w-[1400px] flex-col justify-start pb-28 pt-[104px] md:pt-[112px]">
        <div className="max-w-[34rem]">
          <Reveal delay={0.05}>
            <p className="inline-flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wider text-gold">
              <PixelSparkle size={12} /> PROJECT GRAVEYARD
            </p>
          </Reveal>

          <Reveal as="h1" delay={0.12} className="mt-4">
            <span id="hero-title" className="block font-pixel text-[clamp(1.45rem,3.3vw,3.1rem)] uppercase leading-[1.3] text-cream px-text-shadow">
              Your ideas
              <br />
              aren't <span className="text-lavender">dead.</span>
            </span>
          </Reveal>

          <Reveal as="p" delay={0.22} className="mt-5 text-[clamp(1.05rem,1.6vw,1.3rem)] font-bold leading-snug text-soft [text-shadow:0_2px_0_rgba(23,24,62,.9)]">
            They're just waiting for their next chapter.
          </Reveal>

          <Reveal as="p" delay={0.3} className="mt-3 max-w-[30rem] text-[15px] leading-relaxed text-[#ece8ff] [text-shadow:0_1px_0_rgba(23,24,62,.9)] sm:text-[16px]">
            Bring your unfinished projects out of the graveyard. Understand what remains, discover what's worth saving, and decide what happens next.
          </Reveal>

          <Reveal delay={0.4} className="mt-7 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
            <PixelButton variant="gold" size="lg" accent="arrow" href="#graveyard" onClick={(e) => { e.preventDefault(); scrollToId("graveyard"); }}>
              Enter the graveyard
            </PixelButton>
            <PixelButton variant="ghost" size="md" accent="sparkle" href="#paths" onClick={(e) => { e.preventDefault(); scrollToId("paths"); }}>
              How It Works
            </PixelButton>
          </Reveal>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-16 sm:flex-row sm:items-end sm:justify-between">
          <Reveal as="p" delay={0.55} className="font-mono text-[12px] uppercase tracking-[0.12em] text-cream [text-shadow:0_2px_0_rgba(23,24,62,.9)] sm:text-[13px]">
            Continue. Restart. Pivot. Repurpose. Or let go.
          </Reveal>
          <a
            href="#graveyard"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("graveyard");
            }}
            className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold hover:text-cream"
          >
            Scroll
            <ChevronDown size={18} strokeWidth={3} aria-hidden="true" className="sprite-hop" />
          </a>
        </div>
      </div>
    </section>
  );
}
