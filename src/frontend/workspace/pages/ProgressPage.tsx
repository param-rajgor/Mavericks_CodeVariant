import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { journeyOf } from '@/backend/domain/insights';
import { PageHeader } from '@/frontend/ui/primitives';
import { PixelSprite, ROCKET } from '@/frontend/ui/PixelSprite';

/** "Your Progress": five stepping stones from stalled ideas to a clearer tomorrow, counted from the real projects. */
export function ProgressPage() {
  const { projects } = useProjects();
  const j = useMemo(() => journeyOf(projects), [projects]);

  return (
    <div>
      <PageHeader title="Your Progress" subtitle="From stalled ideas to a clearer tomorrow." />

      <section className="rl-panel rl-panel-hi mb-10 max-w-md p-6" aria-labelledby="lvl-h">
        <p className="pixel-label text-dim">Your journey</p>
        <h2 id="lvl-h" className="mt-2 font-display text-3xl font-bold leading-tight text-soft">
          Level {j.level}: {j.levelName}
        </h2>
        <div className="mt-4 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={j.done} aria-label="Journey steps">
          {j.steps.map((s) => (
            <span key={s.n} className="h-4 flex-1 border-2 border-night" style={{ background: s.done ? '#9ce6bd' : '#34316c' }} />
          ))}
        </div>
        <p className="mt-2 text-lg font-extrabold text-mint">{j.done} / 5 steps</p>
        <p className="mt-2 text-lg text-dim">{j.note}</p>
      </section>

      <ol className="grid gap-6 md:grid-cols-5">
        {j.steps.map((s, i) => (
          <li key={s.n} className="relative">
            <div className="rl-panel flex h-full flex-col items-center p-5 text-center" style={{ marginTop: i % 2 ? 28 : 0 }}>
              <span className="notched mb-3 grid size-16 place-items-center border-2 border-night" style={{ background: s.done ? '#c3b5e6' : '#34316c' }}>
                {i === 4 ? <PixelSprite sprite={ROCKET} px={3} /> : s.done ? <Check size={30} color="#4a3e80" strokeWidth={3.5} aria-hidden="true" /> : <span className="font-display text-2xl font-bold text-dim">{s.n}</span>}
              </span>
              <span className="rl-status mb-3" style={s.done ? { background: '#a9e8bf', color: '#1f5534', borderColor: '#5fb37e' } : { background: '#ffd36e', color: '#5a3b0c', borderColor: '#d9a23a' }}>
                {s.done ? 'Done' : 'Next'}
              </span>
              <h3 className="font-display text-xl font-bold leading-tight text-soft">{s.title}</h3>
              <p className="mt-2 text-base text-dim">{s.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
