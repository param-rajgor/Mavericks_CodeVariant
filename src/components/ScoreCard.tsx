import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { Analysis, FactorResult } from '../domain/analysis';
import { FACTOR_LABELS } from '../domain/analysis';

/** Counts up smoothly to `target`; shows the final number at once under reduced motion. */
function useCountUp(target: number | null): number | null {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<number | null>(target);
  useEffect(() => {
    if (target == null || reduce) {
      setShown(target);
      return;
    }
    const from = shown ?? 0;
    const controls = animate(from, target, { duration: 0.7, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
    // `shown` is intentionally read only as the animation's starting point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduce]);
  return shown;
}

const R = 52;
const C = 2 * Math.PI * R;

export function ScoreRing({ analysis, size = 160 }: { analysis: Analysis; size?: number }) {
  const shown = useCountUp(analysis.total);
  const provisional = analysis.status === 'provisional';
  const label =
    analysis.total == null
      ? 'Relaunch Score not available yet. More information is needed.'
      : `Relaunch Score ${analysis.total} out of 100${provisional ? ', provisional' : ''}.`;
  const frac = (shown ?? 0) / 100;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#E5DFF7" strokeWidth="12" />
        {analysis.total != null && (
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={provisional ? '#A982F2' : '#5543A5'}
            strokeWidth="12"
            strokeDasharray={provisional ? `${C * frac} ${C}` : `${C * frac} ${C}`}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {analysis.total == null ? (
          <span className="px-4 text-xs font-bold text-muted">Add a bit more to see your score</span>
        ) : (
          <div>
            <div className="font-mono text-4xl font-semibold leading-none" aria-hidden>
              {shown}
            </div>
            <div className="mt-1 font-mono text-xs text-muted" aria-hidden>
              / 100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScoreStatusLabel({ analysis }: { analysis: Analysis }) {
  if (analysis.status === 'complete')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F6E0] px-3 py-1 text-xs font-extrabold text-[#1D5A2C]">
        <Sparkles aria-hidden className="size-3.5" /> Analysis complete
      </span>
    );
  if (analysis.status === 'provisional')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9B8] px-3 py-1 text-xs font-extrabold text-[#6B4A00]">
        <AlertCircle aria-hidden className="size-3.5" /> Provisional score
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-extrabold text-[#3b2f86]">
      <AlertCircle aria-hidden className="size-3.5" /> More information needed
    </span>
  );
}

function FactorRow({ f }: { f: FactorResult }) {
  const missing = f.value == null;
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-extrabold">{f.label}</h4>
          <span className="chip font-mono">{f.weight}%</span>
        </div>
        <div className="font-mono text-xs text-muted">
          {missing ? (
            <span className="font-semibold text-[#6B4A00]">Not entered</span>
          ) : (
            <>
              <span className="font-semibold text-night">{Math.round(f.value!)}</span>/100
              {f.contribution != null && <span className="ml-2 font-semibold text-twilight">+{f.contribution.toFixed(1)} pts</span>}
            </>
          )}
        </div>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-[#ece7fb]" aria-hidden>
        {missing ? <div className="h-full w-full" style={{ background: 'repeating-linear-gradient(45deg,#d9d3ee 0 6px,transparent 6px 12px)' }} /> : <div className="h-full bg-twilight" style={{ width: `${f.value}%` }} />}
      </div>
      <p className="mt-1.5 text-sm text-muted">{f.explanation}</p>
    </li>
  );
}

export function FactorBreakdown({ analysis }: { analysis: Analysis }) {
  return (
    <ul className="divide-y-2 divide-line" aria-label="Score breakdown by factor">
      {analysis.factors.map((f) => (
        <FactorRow key={f.key} f={f} />
      ))}
    </ul>
  );
}

/** Compact version for the live preview next to the form. */
export function MiniScore({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <ScoreRing analysis={analysis} size={112} />
        <div className="space-y-2">
          <ScoreStatusLabel analysis={analysis} />
          <p className="text-xs text-muted">Updates as you type. Nothing is saved until you confirm.</p>
        </div>
      </div>
      <ul className="space-y-1.5" aria-label="Score factors so far">
        {analysis.factors.map((f) => (
          <li key={f.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold">{FACTOR_LABELS[f.key]}</span>
            <span className="font-mono text-muted">{f.value == null ? '—' : Math.round(f.value)}</span>
          </li>
        ))}
      </ul>
      {analysis.warnings.map((w) => (
        <p key={w} className="rounded-md bg-[#FFF1D2] p-2 text-xs text-[#6B4A00]">
          {w}
        </p>
      ))}
    </div>
  );
}
