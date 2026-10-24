import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/src/landing/lib/scroll";
import { useDialogA11y } from "@/src/landing/hooks/useDialogA11y";
import { NavItem } from "./NavItem";
import { PixelButton } from "./PixelButton";
import { PixelRocket } from "./icons";

const LINKS = [
  { id: "paths", label: "How It Works" },
  { id: "graveyard", label: "Explore" },
  { id: "about", label: "About" },
] as const;

interface HeaderProps {
  onGetStarted: () => void;
}

function MobileMenu({
  onClose,
  onGetStarted,
  active,
}: HeaderProps & { onClose: () => void; active: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogA11y(ref, onClose, "a");
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    // wait for scroll-lock to release before scrolling
    window.setTimeout(() => scrollToId(id), 30);
  };
  return (
    <motion.div
      className="fixed inset-0 z-[60] md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 bg-navy/85" onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        className="px-box absolute inset-x-4 top-20 bg-indigo p-5 outline-none"
        style={{ ["--bc" as string]: "#A982F2" }}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {LINKS.map((l) => (
            <NavItem key={l.id} href={`#${l.id}`} onClick={go(l.id)} active={active === l.id} large>
              {l.label}
            </NavItem>
          ))}
          <NavItem href="#/projects" large>
            My Projects
          </NavItem>
        </nav>
        <div className="mt-5 grid grid-cols-1 gap-4 pb-2">
          <PixelButton
            variant="lavender"
            size="sm"
            accent="sparkle"
            onClick={() => {
              onClose();
              window.setTimeout(onGetStarted, 30);
            }}
          >
            Get Started
          </PixelButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Header({ onGetStarted }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuBtn = useRef<HTMLButtonElement>(null);

  // only touches state when the boolean actually flips
  useEffect(() => {
    let last = false;
    const onScroll = () => {
      const next = window.scrollY > 48;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    const ids = ["graveyard", "paths", "site-footer"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id === "site-footer" ? "about" : e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors [transition-timing-function:steps(4)] duration-200 ${
        scrolled ? "bg-navy/90 shadow-[0_4px_0_0_rgba(85,67,165,0.8)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-[90%] max-w-[1400px] items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex min-h-[44px] items-center gap-3"
          aria-label="Relaunch — back to top"
        >
          <PixelRocket size={34} className="sprite-hop" />
          <span className="font-pixel text-[13px] tracking-wide text-soft px-text-shadow-sm sm:text-[15px]">RELAUNCH</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <NavItem
              key={l.id}
              href={`#${l.id}`}
              active={active === l.id}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(l.id);
              }}
            >
              {l.label}
            </NavItem>
          ))}
          <NavItem href="#/projects">My Projects</NavItem>
          <PixelButton variant="lavender" size="sm" accent="sparkle" onClick={onGetStarted}>
            Get Started
          </PixelButton>
        </nav>

        <button
          ref={menuBtn}
          type="button"
          className="px-box inline-flex h-11 w-11 items-center justify-center bg-navy text-cream md:hidden"
          style={{ ["--bc" as string]: "#A982F2", ["--sh" as string]: "transparent" }}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={22} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <MobileMenu
            active={active}
            onClose={() => setOpen(false)}
            onGetStarted={onGetStarted}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
