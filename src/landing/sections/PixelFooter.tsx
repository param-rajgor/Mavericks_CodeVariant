import type { MouseEvent } from "react";
import { Reveal } from "@/src/landing/components/Reveal";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Starfield } from "@/src/landing/components/PixelBackground";
import { PixelRocket } from "@/src/landing/components/icons";
import { scrollToId } from "@/src/landing/lib/scroll";

interface Props {
  onGetStarted: () => void;
  onNotify?: (msg: string) => void;
}

export function PixelFooter({ onGetStarted, onNotify }: Props) {
  const jump = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <footer id="site-footer" className="relative z-10 overflow-hidden bg-navy/[0.97] border-t-4 border-[#3A2A82]">
      <style>{`.footer-link{display:inline-flex;min-height:40px;align-items:center;color:#d8d3f5;font-weight:600;font-size:14px;transition:color 150ms}.footer-link:hover{color:#FFC857}`}</style>
      <Starfield count={50} maxY={100} seed={41} className="!h-full opacity-70" />

      {/* Stepped grass top border */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-3"
        style={{
          background:
            "repeating-linear-gradient(90deg,#4f8741 0 20px,#7dbd65 20px 28px,#4f8741 28px 44px)",
        }}
      />

      <div className="relative mx-auto w-[90%] max-w-[1280px] pb-12 pt-20 text-center">
        <Reveal as="h2" className="mx-auto max-w-3xl font-pixel text-[clamp(1.4rem,3vw,2.4rem)] uppercase leading-[1.2] text-cream px-text-shadow">
          READY TO BRING AN IDEA BACK TO LIFE?
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-4 text-[16px] text-[#e1dcf8]">
          Your next chapter can start with one small decision.
        </Reveal>

        <Reveal delay={0.16} className="mt-8 flex flex-col items-center gap-4">
          <PixelButton variant="gold" size="lg" accent="arrow" onClick={onGetStarted}>
            ENTER THE APP →
          </PixelButton>

          <a
            href="#graveyard"
            onClick={jump("graveyard")}
            className="inline-flex min-h-[44px] items-center font-mono text-[12px] font-bold uppercase tracking-wide text-gold underline decoration-2 underline-offset-4 hover:text-cream"
          >
            Explore the graveyard again ↑
          </a>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 border-t-2 border-[#5543A5]/60 pt-12 text-left sm:grid-cols-2 lg:grid-cols-4">
          <div id="about" tabIndex={-1} className="outline-none">
            <div className="flex items-center gap-3">
              <PixelRocket size={32} />
              <span className="font-pixel text-[13px] text-soft">RELAUNCH</span>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[#d8d3f5]">
              Your ideas aren't dead. They're just waiting for their next chapter.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 border border-[#A8E6A1] bg-[#17183E] px-2.5 py-1 font-mono text-[10px] text-[#A8E6A1]">
              <span>🔒</span> Local-First · No Account Needed
            </div>
          </div>

          <nav aria-label="Explore">
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">Navigation</h3>
            <ul className="mt-2.5 space-y-1">
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard")}>Project Graveyard</a></li>
              <li><a href="#paths" className="footer-link" onClick={jump("paths")}>The Five Paths</a></li>
              <li><a href="#top" className="footer-link" onClick={jump("top")}>Back to Top</a></li>
            </ul>
          </nav>

          <nav aria-label="App Views">
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">App Features</h3>
            <ul className="mt-2.5 space-y-1">
              <li><a href="#/projects" className="footer-link">My Projects</a></li>
              <li><a href="#/timeline" className="footer-link">Timeline & Journal</a></li>
              <li><a href="#/paths" className="footer-link">Decision Shrine</a></li>
              <li><a href="#/archive" className="footer-link">Respectful Archive</a></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">Local & Private</h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#b4afe3]">
              All project assessments, timelines, and decision checklists remain safely in your browser storage.
            </p>
            <p className="mt-4 font-mono text-[11px] text-[#867FB5]">
              Built for Code Variant Build 01
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[#3A2A82]/50 pt-6 text-center font-mono text-[11px] text-[#867FB5]">
          © {new Date().getFullYear()} Relaunch. Crafting second chances for good ideas.
        </div>
      </div>
    </footer>
  );
}
