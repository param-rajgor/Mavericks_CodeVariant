import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, innermost last, so only the top one reacts to keys. */
const stack: symbol[] = [];

/** Traps Tab inside `ref`, closes on Escape, locks page scroll, and returns focus to the opener. */
export function useModalBehavior(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const me = Symbol('modal');
    stack.push(me);
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== me) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      stack.splice(stack.indexOf(me), 1);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, ref]);
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Prevent closing by backdrop click (Esc still works), e.g. forms with unsaved input. */
  lockBackdrop?: boolean;
}

const WIDTH = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' } as const;

function DialogBody({ onClose, title, description, children, footer, size = 'md', lockBackdrop }: Omit<DialogProps, 'open'>) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useModalBehavior(ref, true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-night/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={lockBackdrop ? undefined : onClose}
        aria-hidden
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`rl-panel relative flex max-h-[92svh] w-full flex-col ${WIDTH[size]} rounded-b-none sm:rounded-b-xl`}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <header className="flex items-start gap-3 border-b-[3px] border-rule p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="rl-title text-2xl">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-2 text-sm text-dim">
                {description}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="-m-1 grid size-11 shrink-0 place-items-center rounded-md text-cream hover:bg-panel-2">
            <X aria-hidden className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t-[3px] border-rule p-4 sm:px-5">{footer}</footer>}
      </motion.div>
    </div>
  );
}

export function Dialog(props: DialogProps) {
  const { open, ...rest } = props;
  return createPortal(<AnimatePresence>{open && <DialogBody key="dialog" {...rest} />}</AnimatePresence>, document.body);
}
