import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Archive, Compass, Layers, Pause, RefreshCw, RotateCcw, Signpost, Sprout, type LucideIcon } from 'lucide-react';
import { Link } from '../lib/router';
import { PATHS, STATUS_META } from '../domain/paths';
import type { PathId, Status } from '../domain/types';

export const PATH_ICONS: Record<PathId, LucideIcon> = {
  continue: RefreshCw,
  restart: RotateCcw,
  pivot: Signpost,
  repurpose: Layers,
  archive: Archive,
};

export const STATUS_ICONS: Record<Status, LucideIcon> = {
  active: Sprout,
  stalled: Pause,
  'needs-direction': Compass,
  archived: Archive,
};

/** Status always pairs colour with an icon and a text label. */
export function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold" style={{ background: m.soft, color: m.ink }} title={m.definition}>
      <Icon aria-hidden className="size-3.5" />
      {m.label}
    </span>
  );
}

export function PathBadge({ path, prefix, size = 'sm' }: { path: PathId; prefix?: string; size?: 'sm' | 'md' }) {
  const m = PATHS[path];
  const Icon = PATH_ICONS[path];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-extrabold ${size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}
      style={{ background: m.soft, color: m.ink, boxShadow: `inset 0 0 0 2px ${m.accent}` }}
    >
      <Icon aria-hidden className={size === 'md' ? 'size-4' : 'size-3.5'} />
      {prefix && <span className="font-semibold">{prefix}</span>}
      {m.label}
    </span>
  );
}

export function SampleChip() {
  return (
    <span className="chip !bg-cream !text-[#6B4A00]" title="A sample project shipped with Relaunch, not something you created">
      Sample
    </span>
  );
}

type Variant = 'default' | 'gold' | 'purple' | 'ghost' | 'rose';
const VARIANT: Record<Variant, string> = { default: '', gold: 'rl-btn-gold', purple: 'rl-btn-purple', ghost: 'rl-btn-ghost', rose: 'rl-btn-rose' };

export function buttonClass(variant: Variant = 'default', small = false, extra = '') {
  return `rl-btn ${VARIANT[variant]} ${small ? 'rl-btn-sm' : ''} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}
export function Button({ variant = 'default', small, className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, small, className)} {...rest} />;
}

export function LinkButton({ to, variant = 'default', small, className = '', children, ...rest }: { to: string; variant?: Variant; small?: boolean; className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <Link to={to} className={buttonClass(variant, small, className)} {...rest}>
      {children}
    </Link>
  );
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label + hint + inline error, wired together for screen readers. */
export function Field({ label, hint, error, optional, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-extrabold">
        {label} {optional && <span className="font-semibold text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: !!error })}
      {error && (
        <p id={errId} role="alert" className="text-sm font-bold text-[#a23a0a]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Fieldset wrapper for groups of radios/checkboxes. */
export function Group({ legend, hint, error, children }: { legend: string; hint?: ReactNode; error?: string; children: ReactNode }) {
  const id = useId();
  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="text-sm font-extrabold">{legend}</legend>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-sm font-bold text-[#a23a0a]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function ProgressBar({ value, label, color = '#5543A5' }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="h-2.5 flex-1 overflow-hidden rounded-sm border-2 border-night bg-[#ece7fb]"
      >
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-10 text-right font-mono text-xs font-semibold">{Math.round(value)}%</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rl-panel-flat flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-md border-[3px] border-night bg-cream shadow-[3px_3px_0_#17183E]">
        <Icon aria-hidden className="size-7" />
      </span>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="max-w-md text-sm text-muted">{children}</p>
      {action}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 p-12 text-muted">
      <span aria-hidden className="size-5 animate-spin rounded-sm border-4 border-lavender border-t-night" />
      <span className="font-semibold">{label}…</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="pixel-label mb-2 text-twilight">{eyebrow}</p>}
        <h1 id="page-title" tabIndex={-1} className="text-3xl font-extrabold leading-tight outline-none">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2 text-sm font-extrabold uppercase tracking-wide text-twilight">
      {children}
    </h2>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
      {tags.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  );
}
