import { motion } from "motion/react";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useDialogA11y } from "@/src/landing/hooks/useDialogA11y";

interface ModalProps {
  titleId: string;
  descId: string;
  onClose: () => void;
  children: ReactNode;
  /** accent colour for the top rail */
  accent?: string;
  /** CSS selector of the element that should take focus first */
  initialFocus?: string;
  maxWidth?: string;
}

/** Accessible pixel dialog shell. Render inside <AnimatePresence> while open. */
export function Modal({
  titleId,
  descId,
  onClose,
  children,
  accent = "#A982F2",
  initialFocus,
  maxWidth = "36rem",
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogA11y(ref, onClose, initialFocus);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-navy/80" onClick={onClose} aria-hidden="true" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="px-box relative max-h-[92svh] w-full overflow-y-auto bg-indigo outline-none sm:max-h-[88svh]"
        style={{ maxWidth, ["--bc" as string]: accent, ["--sh" as string]: "#0d0e2b" }}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-2 w-full" style={{ background: accent }} aria-hidden="true" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-5 inline-flex h-11 w-11 items-center justify-center border-2 border-twilight bg-navy text-cream hover:border-gold hover:text-gold"
        >
          <X size={20} strokeWidth={3} aria-hidden="true" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
