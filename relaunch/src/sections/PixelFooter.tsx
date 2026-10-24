import { Star } from "lucide-react";
import type { MouseEvent } from "react";
import { Reveal } from "@/src/components/Reveal";
import { PixelButton } from "@/src/components/PixelButton";
import { Starfield } from "@/src/components/PixelBackground";
import { PixelRocket } from "@/src/components/icons";
import { EXTERNAL_LINKS } from "@/src/config";
import { scrollToId } from "@/src/lib/scroll";
import type { StatusFilter } from "@/src/data/types";

interface Props {
  onGetStarted: () => void;
  onFilterJump: (f: StatusFilter) => void;
  onNotify: (msg: string) => void;
}

export function PixelFooter({ onGetStarted, onFilterJump, onNotify }: Props) {
  const jump = (id: string, filter?: StatusFilter) => (e: MouseEvent) => {
    e.preventDefault();
    if (filter) onFilterJump(filter);
    scrollToId(id);
  };

  const ext = (key: keyof typeof EXTERNAL_LINKS, label: string) => {
    const url = EXTERNAL_LINKS[key];
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="footer-link">
        {label}
      </a>
    ) : (
      <a
        href="#site-footer"
        className="footer-link"
        onClick={(e) => {
          e.preventDefault();
          onNotify(`"${label}" is a placeholder link — set its URL in src/config.ts.`);
        }}
      >
        {label}
      </a>
    );
  };

  return (
    <footer id="site-footer" className="relative z-10 overflow-hidden bg-navy/[0.97]">
      <style>{`.footer-link{display:inline-flex;min-height:44px;align-items:center;color:#d8d3f5;font-weight:600;font-size:15px}.footer-link:hover{color:#FFC857}`}</style>
      <Starfield count={60} maxY={100} seed={41} className="!h-full opacity-80" />
      {/* golden horizon, stepped */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[84px] flex flex-col">
        {[0.04, 0.07, 0.11, 0.16].map((a, i) => (
          <div key={i} className="h-3" style={{ background: `rgba(255,200,87,${a})` }} />
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-3" style={{ background: "repeating-linear-gradient(90deg,#4f8741 0 20px,#7dbd65 20px 28px,#4f8741 28px 44px)" }} />

      <div className="relative mx-auto w-[90%] max-w-[1280px] pb-8 pt-24 text-center">
        <Reveal as="h2" className="mx-auto max-w-3xl text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.1] text-soft">
          Ready to bring an idea back to life?
        </Reveal>
        <Reveal as="p" delay={0.08} className="mt-4 text-[17px] text-[#e1dcf8]">
          Your next chapter can start with one small decision.
        </Reveal>
        <Reveal delay={0.16} className="mt-9 flex flex-col items-center gap-6">
          <PixelButton variant="gold" size="lg" accent="arrow" onClick={onGetStarted}>
            Get started
          </PixelButton>
          <a
            href="#graveyard"
            onClick={jump("graveyard")}
            className="inline-flex min-h-[44px] items-center font-mono text-[13px] font-bold uppercase tracking-wide text-gold underline decoration-2 underline-offset-4 hover:text-cream"
          >
            Explore the graveyard again
          </a>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-12 border-t-4 border-twilight/70 pt-14 text-left sm:grid-cols-2 lg:grid-cols-4">
          <div id="about" tabIndex={-1} className="scroll-mt-24 outline-none">
            <div className="flex items-center gap-3">
              <PixelRocket size={34} />
              <span className="font-pixel text-[14px] text-soft">RELAUNCH</span>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#d8d3f5]">
              Your ideas aren't dead. They're just waiting for their next chapter.
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">Explore</h3>
            <ul className="mt-3">
              <li><a href="#paths" className="footer-link" onClick={jump("paths")}>How It Works</a></li>
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard")}>Project Graveyard</a></li>
              <li><a href="#paths" className="footer-link" onClick={jump("paths")}>The Five Paths</a></li>
              <li><a href="#about" className="footer-link" onClick={jump("about")}>About Relaunch</a></li>
            </ul>
          </nav>

          <nav aria-label="Your projects">
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">Your Projects</h3>
            <ul className="mt-3">
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard", "All")}>My Projects</a></li>
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard", "Stalled")}>Stalled Ideas</a></li>
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard", "To Revisit")}>Saved Work</a></li>
              <li><a href="#graveyard" className="footer-link" onClick={jump("graveyard", "Archived")}>Archive</a></li>
            </ul>
          </nav>

          <nav aria-label="Connect">
            <h3 className="font-pixel text-[10px] uppercase tracking-wider text-lavender">Connect</h3>
            <ul className="mt-3">
              <li>{ext("contact", "Contact")}</li>
              <li>{ext("github", "GitHub")}</li>
              <li>{ext("docs", "Documentation")}</li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t-4 border-twilight/70 pt-6 sm:flex-row">
          <p className="font-mono text-[12px] text-[#c9c4ee]">© 2026 Relaunch. Every idea has a story.</p>
          <p className="flex items-center gap-2 text-gold" aria-hidden="true">
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <PixelRocket size={22} />
            <Star size={14} fill="currentColor" strokeWidth={0} />
          </p>
        </div>
      </div>
    </footer>
  );
}
