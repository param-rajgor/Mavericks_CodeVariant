import { useMemo } from 'react';
import { useProjects } from '../store/ProjectsContext';
import { PageHeader } from '../components/ui';
import { Island, Rocket, Tomb } from '../ui/pixel';
import { journeyOf } from '../domain/insights';

/** Island centres as a percentage of the map, left to right in a gentle zig-zag. */
const SPOTS = [
  { x: 13, y: 70 },
  { x: 31, y: 44 },
  { x: 50, y: 66 },
  { x: 69, y: 34 },
  { x: 88, y: 60 },
] as const;

function StepChip({ done }: { done: boolean }) {
  return (
    <span className="rl-status" style={done ? { background: '#3ddc84', color: '#0d2f1b' } : { background: '#ffc857', color: '#4d3200' }}>
      {done ? 'Done' : 'Next'}
    </span>
  );
}

export function ProgressPage() {
  const { projects } = useProjects();
  const j = useMemo(() => journeyOf(projects), [projects]);

  return (
    <div className="mx-auto max-w-[88rem]">
      <PageHeader title="Your Progress" subtitle="From stalled ideas to a clearer tomorrow." />

      <div className="relative space-y-6 lg:space-y-0">
        <section className="rl-panel relative z-10 max-w-[22rem] p-5" aria-labelledby="lvl-h">
          <p className="font-mono text-[11px] tracking-widest text-dim">YOUR JOURNEY</p>
          <h2 id="lvl-h" className="mt-2 font-title text-3xl font-bold leading-tight text-soft">
            Level {j.level}: {j.levelName}
          </h2>
          <div className="mt-4 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={j.done} aria-label="Journey steps">
            {j.steps.map((s) => (
              <span key={s.n} className="h-3.5 flex-1 rounded-[2px]" style={{ background: s.done ? '#3ddc84' : '#2b2a6d' }} />
            ))}
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-[#3ddc84]">{j.done} / 5 steps</p>
          <p className="mt-2 text-sm text-cream">{j.note}</p>
        </section>

        {/* desktop: a trail of islands */}
        <div className="relative -mt-28 hidden w-full lg:block" style={{ aspectRatio: '1157 / 560' }}>
          <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={SPOTS.map((s) => `${s.x},${s.y - 8}`).join(' ')}
              fill="none"
              stroke="#ffd98a"
              strokeWidth="1.1"
              strokeDasharray="1 12"
              strokeLinecap="square"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 5 }}
            />
          </svg>
          {j.steps.map((s, i) => {
            const p = SPOTS[i];
            return (
              <div key={s.n} className="absolute w-[19%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <div className="relative" style={{ opacity: s.done || i === 4 ? 1 : 0.7 }}>
                  <Island variant={i + 2} className="w-full" style={i === 4 && !s.done ? { filter: 'saturate(0.5) brightness(0.85)' } : undefined} />
                  {i === 4 ? (
                    <Rocket className="absolute left-1/2 w-[22%] -translate-x-1/2" style={{ bottom: '58%' }} />
                  ) : (
                    <Tomb className="absolute left-1/2 w-[26%] -translate-x-1/2" style={{ bottom: '50%', aspectRatio: '18 / 24', height: 'auto' }} />
                  )}
                </div>
                <div className="-mt-1 text-center">
                  <p className="flex items-center justify-center gap-2 font-mono text-xs text-dim">
                    {s.n} <StepChip done={s.done} />
                  </p>
                  <p className="font-title text-xl font-bold leading-tight text-soft [text-shadow:2px_2px_0_#0d0e2b]">{s.title}</p>
                  <p className="text-sm text-cream [text-shadow:0_2px_0_#0d0e2b]">{s.blurb}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* phones and tablets: the same steps as a list */}
        <ol className="space-y-3 lg:hidden">
          {j.steps.map((s, i) => (
            <li key={s.n} className="rl-panel flex items-center gap-4 p-3">
              <span className="relative block w-24 shrink-0">
                <Island variant={i + 2} className="w-full" />
                {i === 4 ? (
                  <Rocket className="absolute left-1/2 w-[24%] -translate-x-1/2" style={{ bottom: '55%' }} />
                ) : (
                  <Tomb className="absolute left-1/2 w-[28%] -translate-x-1/2" style={{ bottom: '48%', aspectRatio: '18 / 24', height: 'auto' }} />
                )}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-mono text-xs text-dim">
                  {s.n} <StepChip done={s.done} />
                </span>
                <span className="block font-title text-xl font-bold text-soft">{s.title}</span>
                <span className="block text-sm text-cream">{s.blurb}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
