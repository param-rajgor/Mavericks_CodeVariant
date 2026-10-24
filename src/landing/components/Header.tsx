import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/src/landing/lib/scroll";
import { useDialogA11y } from "@/src/landing/hooks/useDialogA11y";
import { NavItem } from "./NavItem";
import { PixelButton } from "./PixelButton";
import { PixelRocket } from "./icons";

const LINKS = [
  { id: "graveyard", label: "How It Works" },
  { id: "graveyard", label: "Explore" },
  { id: "paths", label: "5 Paths" },
] as const;

interface HeaderProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

function MobileMenu({
  onClose,
  onGetStarted,
  onLogin,
  active,
}: HeaderProps & { onClose: () => void; active: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogA11y(ref, onClose, "a");

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    window.setTimeout(() => scrollToId(id), 50);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        className="px-box absolute inset-x-4 top-20 bg-indigo p-5 outline-none border-2 border-lavender"
        style={{ ["--bc" as string]: "#A982F2" }}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-twilight">
          <span className="font-pixel text-[11px] text-gold">RELAUNCH MENU</span>
          <button
            type="button"
            onClick={onClose}
            className="text-cream hover:text-gold p-1"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col mt-3 space-y-1">
          {LINKS.map((l, i) => (
            <NavItem key={i} href={`#${l.id}`} onClick={go(l.id)} active={active === l.id} large>
              {l.label}
            </NavItem>
          ))}
        </nav>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-twilight pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogin?.();
            }}
            className="w-full py-2.5 bg-navy border-2 border-lavender font-pixel text-[10px] text-cream uppercase hover:bg-twilight"
          >
            Log In
          </button>

          <PixelButton
            variant="lavender"
            size="sm"
            accent="sparkle"
            onClick={() => {
              onClose();
              window.setTimeout(onGetStarted, 40);
            }}
          >
            Get Started
          </PixelButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Header({ onGetStarted, onLogin }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = false;
    const onScroll = () => {
      const next = window.scrollY > 40;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md shadow-[0_4px_0_0_rgba(85,67,165,0.8)] border-b border-[#5543A5]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] sm:h-[72px] w-[92%] max-w-[1400px] items-center justify-between">
        {/* Logo and Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex min-h-[44px] items-center gap-3 group"
          aria-label="Relaunch — back to top"
        >
          <PixelRocket size={34} className="sprite-hop transition-transform group-hover:scale-110" />
          <span className="font-pixel text-[13px] sm:text-[15px] tracking-wide text-soft px-text-shadow-sm">
            RELAUNCH
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <NavItem
            href="#graveyard"
            active={active === "graveyard"}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("graveyard");
            }}
          >
            How It Works
          </NavItem>

          <NavItem
            href="#graveyard"
            active={active === "explore"}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("graveyard");
            }}
          >
            Explore
          </NavItem>

          <NavItem
            href="#paths"
            active={active === "paths"}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("paths");
            }}
          >
            5 Paths
          </NavItem>

          {/* Log In Button (pill with border, matching video) */}
          <button
            type="button"
            onClick={onLogin}
            className="border-2 border-[#A982F2] bg-[#17183E]/80 hover:bg-[#2A2B5C] px-3.5 py-1.5 font-pixel text-[10px] text-[#ECE8FF] uppercase transition-colors"
          >
            Log In
          </button>

          {/* Get Started Button (lavender filled button) */}
          <PixelButton
            variant="lavender"
            size="sm"
            accent="sparkle"
            onClick={onGetStarted}
          >
            Get Started
          </PixelButton>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          ref={menuBtn}
          type="button"
          className="px-box inline-flex h-11 w-11 items-center justify-center bg-navy text-cream md:hidden border-2 border-lavender"
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
            onLogin={onLogin}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
