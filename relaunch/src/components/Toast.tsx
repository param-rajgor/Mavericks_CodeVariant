import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onDone: () => void;
}

/** Polite live-region message used for demo-only notices. */
export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, 3600);
    return () => window.clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="px-box pointer-events-auto max-w-md bg-navy px-5 py-3 font-mono text-[13px] leading-snug text-cream"
            style={{ ["--bc" as string]: "#FFC857" }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
