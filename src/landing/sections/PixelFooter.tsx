import { PixelRocket } from "@/src/landing/components/icons";

/** Minimal footer. Also marks the end of the scroll for the scrubbed video. */
export function PixelFooter() {
  return (
    <footer id="site-footer" className="relative z-10 bg-navy/90">
      <div aria-hidden="true" className="h-3" style={{ background: "repeating-linear-gradient(90deg,#4f8741 0 20px,#7dbd65 20px 28px,#4f8741 28px 44px)" }} />
      <div className="mx-auto flex w-[90%] max-w-[1280px] flex-col items-center justify-between gap-3 py-6 sm:flex-row">
        <span className="flex items-center gap-3">
          <PixelRocket size={26} />
          <span className="font-pixel text-[12px] text-soft">RELAUNCH</span>
        </span>
        <p className="font-mono text-[12px] text-[#c9c4ee]">© 2026 Relaunch. Every idea has a story.</p>
      </div>
    </footer>
  );
}
