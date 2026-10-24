import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: Kind;
  title: string;
  message?: string;
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  run: () => void;
}

interface ToastApi {
  success(title: string, message?: string, action?: ToastAction): void;
  error(title: string, message?: string): void;
  info(title: string, message?: string, action?: ToastAction): void;
}

const Ctx = createContext<ToastApi | null>(null);

const ICON = { success: CheckCircle2, error: AlertTriangle, info: Info } as const;
/** Dark toast with a coloured frame and a square swatch; the text label always says what happened. */
const FRAME: Record<Kind, string> = { success: '#a8e6a1', error: '#ff9db5', info: '#dcd6f7' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (kind: Kind, title: string, message?: string, action?: ToastAction) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, kind, title, message, action }]);
      // Errors stay until dismissed so nobody misses a failed save.
      if (kind !== 'error') window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, m, a) => push('success', t, m, a),
      error: (t, m) => push('error', t, m),
      info: (t, m, a) => push('info', t, m, a),
    }),
    [push],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-(--z-toast) flex flex-col items-center gap-2 p-4 sm:items-end" role="region" aria-label="Notifications">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICON[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                role={t.kind === 'error' ? 'alert' : 'status'}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3  bg-night p-3 text-cream shadow-[0_5px_0_#0d0e2b]"
                style={{ border: `3px solid ${FRAME[t.kind]}` }}
              >
                <span aria-hidden className="size-3.5 shrink-0" style={{ background: FRAME[t.kind] }} />
                <Icon aria-hidden className="sr-only" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-extrabold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-dim">{t.message}</p>}
                </div>
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.run();
                      dismiss(t.id);
                    }}
                    className="min-h-11  px-2 text-sm font-bold text-gold underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
                <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="-m-2 grid size-11 place-items-center rounded text-dim hover:text-cream">
                  <X aria-hidden className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside ToastProvider');
  return c;
}

/** Runs an async action, toasting a plain-language failure instead of throwing. Resolves undefined on failure. */
export function useSafe() {
  const toast = useToast();
  return useCallback(
    async <T,>(fn: () => Promise<T>, failure = 'That did not save'): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (e) {
        toast.error(failure, `${e instanceof Error ? e.message : 'Something went wrong.'} Nothing was changed. Please try again.`);
        return undefined;
      }
    },
    [toast],
  );
}
