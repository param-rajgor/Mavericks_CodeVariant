import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { stepsForPath, projectToInput, WEIGHTS, type FactorKey } from '../domain/analysis';
import { PATH_LIST, PATHS, STALL_REASON_META, INTEREST_LABELS } from '../domain/paths';
import type { PathId, Project } from '../domain/types';
import { STATUS_UI, ago, liveAnalysis } from '../domain/insights';
import { useProjects } from '../store/ProjectsContext';
import { navigate, useRoute } from '../lib/router';
import { Button, PageHeader } from '../components/ui';
import { EmptyGraveyard } from '../components/States';
import { ArchiveDialog } from '../components/ProjectDialogs';
import { useSafe, useToast } from '../components/Toast';
import { useShell } from '../components/shellContext';
import { Ghost, PixelArt, SIGNPOST } from '../ui/pixel';

const FACTOR_COLOR: Record<FactorKey, string> = {
  completion: '#7fd4ff',
  recoverableReason: '#a8e6a1',
  reusableAssets: '#f1a0e8',
  freshness: '#ffc857',
  currentInterest: '#c9a8ff',
};

const SEGMENTS = 10;

function ScoreBars({ project }: { project: Project }) {
  const a = liveAnalysis(project);
  const points = a.factors.map((f) => (f.value == null ? null : Math.round(((f.value * f.weight) / 100) * 10) / 10));
  const complete = a.status === 'complete';
  return (
    <section className="rl-panel p-5" aria-labelledby="score-h">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="score-h" className="text-xl font-extrabold text-soft">
            Relaunch Score
          </h2>
          <p className="mt-1 max-w-[13rem] text-xs leading-snug text-cream">A guide built from five visible factors. It is not a prediction.</p>
        </div>
        <p className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="font-title text-6xl font-bold leading-none text-gold" aria-label={a.total == null ? 'No score yet' : `Score ${a.total}${a.status === 'provisional' ? ', provisional' : ''}`}>
            {a.total ?? '—'}
            {a.status === 'provisional' && '*'}
          </span>
          <span className="font-mono text-sm text-dim">/100</span>
        </p>
      </div>
      <ul className="mt-5 space-y-4">
        {a.factors.map((f, i) => {
          const filled = f.value == null ? 0 : Math.round((f.value / 100) * SEGMENTS);
          return (
            <li key={f.key}>
              <p className="flex items-baseline justify-between gap-2 text-[15px] font-extrabold text-soft">
                <span>
                  {f.label} <span className="font-mono text-xs font-medium text-dim">· weight {WEIGHTS[f.key]}</span>
                </span>
                <span className="font-mono text-sm" aria-label={points[i] == null ? 'not known' : `${points[i]} of ${f.weight}`}>
                  {points[i] ?? '—'} / {f.weight}
                </span>
              </p>
              <div className="mt-1.5 flex gap-1" aria-hidden>
                {Array.from({ length: SEGMENTS }, (_, k) => (
                  <span key={k} className="h-3 flex-1 rounded-[2px]" style={{ background: k < filled ? FACTOR_COLOR[f.key] : '#2b2a6d' }} />
                ))}
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-cream">{f.explanation}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 font-mono text-xs leading-relaxed text-dim">
        {complete
          ? `${points.map((p) => p ?? 0).join(' + ')} = ${a.total}.`
          : a.status === 'provisional'
            ? `Known factors are scaled to 100. `
            : 'Add progress and a reason to see a score. '}
        Scores are provisional when details are missing.
      </p>
    </section>
  );
}

export function DecisionHubPage() {
  const route = useRoute();
  const { projects, actions } = useProjects();
  const { openNew } = useShell();
  const safe = useSafe();
  const toast = useToast();
  const open = useMemo(() => projects.filter((p) => p.status !== 'archived'), [projects]);
  const wanted = route.name === 'decision' ? route.id : undefined;

  // Without a project in the link, start with the open project that most needs a decision.
  const fallback = useMemo(() => {
    const undecided = open.filter((p) => !p.selectedPath);
    const pool = undecided.length ? undecided : open;
    return [...pool].sort((a, b) => (liveAnalysis(b).total ?? -1) - (liveAnalysis(a).total ?? -1))[0]?.id;
  }, [open]);
  const [picked, setPicked] = useState<string | undefined>(wanted);
  useEffect(() => setPicked(wanted), [wanted]);
  const project = projects.find((p) => p.id === (picked ?? fallback));

  const analysis = project ? liveAnalysis(project) : null;
  const rec = analysis?.recommendation?.path ?? null;
  const [viewing, setViewing] = useState<PathId | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setViewing(null), [project?.id]);
  const current: PathId = viewing ?? project?.selectedPath ?? rec ?? 'continue';

  if (!project || !analysis) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Decision Hub" subtitle="Every idea reaches a crossroads. Pick the path that fits." />
        <EmptyGraveyard onNew={openNew} filtered={projects.length > 0} />
      </div>
    );
  }

  const input = projectToInput(project);
  const archived = project.status === 'archived';
  const ui = STATUS_UI[project.status];
  const meta = PATHS[current];
  const chosen = project.selectedPath === current;
  const steps = analysis.recommendation?.path === current ? analysis.nextSteps : stepsForPath(input, current);
  const reasons = analysis.recommendation?.path === current ? analysis.recommendation.reasons.slice(0, 2).join(' ') : meta.bestWhen;

  const choose = async () => {
    if (current === 'archive') {
      setArchiving(true);
      return;
    }
    setBusy(true);
    const saved = await safe(() => actions.choosePath(project.id, current), 'Could not save your choice');
    setBusy(false);
    if (saved) toast.success(`${project.name}: path chosen`, `${meta.label}. Recorded in its timeline; you can change it any time.`);
  };

  return (
    <div className="mx-auto max-w-[88rem]">
      <PageHeader title="Decision Hub" subtitle="Every idea reaches a crossroads. Pick the path that fits." />

      <div className="grid gap-5 lg:grid-cols-[18.5rem_1fr]">
        <div className="space-y-5">
          <section className="rl-panel p-5" aria-labelledby="cross-h">
            <h2 id="cross-h" className="text-lg font-extrabold text-soft">
              Project at the crossroads
            </h2>
            <label className="relative mt-3 block">
              <span className="sr-only">Choose a project</span>
              <select
                value={project.id}
                onChange={(e) => {
                  setPicked(e.target.value);
                  navigate(`/decision?project=${e.target.value}`, { replace: true });
                }}
                className="h-14 w-full appearance-none rounded-xl border-[3px] border-lavender bg-[#f3eaff] pl-4 pr-11 text-[17px] font-extrabold text-night"
              >
                {open.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                {archived && <option value={project.id}>{project.name} (archived)</option>}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-twilight" strokeWidth={3} />
            </label>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 font-mono text-xs">
              <div>
                <dt className="text-dim">STATUS</dt>
                <dd className="mt-1">
                  <span className="rl-status font-sans" style={{ background: ui.bg, color: ui.fg }}>
                    {ui.chip}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-dim">PROGRESS</dt>
                <dd className="mt-1 font-sans text-sm font-extrabold text-soft">{project.progress}%</dd>
              </div>
              <div>
                <dt className="text-dim">LAST</dt>
                <dd className="mt-1 font-sans text-sm font-extrabold text-soft">{ago(project)}</dd>
              </div>
              <div>
                <dt className="text-dim">INTEREST</dt>
                <dd className="mt-1 font-sans text-sm font-extrabold text-soft">{project.currentInterest ? INTEREST_LABELS[project.currentInterest].label : '—'}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-cream">
              {project.stallReasonDetails ||
                (project.stallReason ? `Stalled because of ${STALL_REASON_META[project.stallReason].label.toLowerCase()}.` : 'No reason recorded yet.')}
            </p>
          </section>
          <ScoreBars project={project} />
        </div>

        <div className="min-w-0">
          <div role="radiogroup" aria-label="Choose a path" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PATH_LIST.map((p, i) => {
              const on = current === p.id;
              const isRec = rec === p.id;
              const assets = new Set(project.assets).size;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setViewing(p.id)}
                  className="relative flex min-h-[15rem] flex-col rounded-xl p-5 text-left transition-transform hover:-translate-y-1"
                  style={{
                    background: '#15163f',
                    border: `3px solid ${on ? p.accent : '#3b3585'}`,
                    boxShadow: on ? `0 5px 0 #0d0e2b, 0 0 0 2px #15163f, 0 0 18px ${p.accent}66` : '0 5px 0 #0d0e2b',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-md px-2.5 py-0.5 font-mono text-[11px] font-bold text-night" style={{ background: p.accent }}>
                      Path {i + 1}
                    </span>
                    {isRec && <span className="rounded-md bg-gold px-2.5 py-0.5 font-mono text-[11px] font-bold text-night">Recommended</span>}
                  </span>
                  <PixelArt sprite={SIGNPOST} className="absolute right-4 top-4 w-14 opacity-95" />
                  <span className="mt-3 block font-title text-4xl font-bold leading-none" style={{ color: p.accent }}>
                    {p.label}
                  </span>
                  <span className="mt-3 block text-[15px] leading-snug text-cream">{p.tagline}</span>
                  <span className="mt-3 block text-[13px] font-extrabold leading-snug text-gold">Best when {p.bestWhen.charAt(0).toLowerCase() + p.bestWhen.slice(1)}</span>
                  <span className="mt-auto block pt-4 font-mono text-[11px] uppercase leading-snug tracking-wide" style={{ color: on ? p.accent : '#bdb6e8' }}>
                    {on
                      ? p.id === 'repurpose'
                        ? `Selected · ${assets} reusable asset${assets === 1 ? '' : 's'}`
                        : project.selectedPath === p.id
                          ? 'Chosen ✓'
                          : 'Selected'
                      : `Next: ${(stepsForPath(input, p.id)[0] ?? '').replace(/^./, (c) => c.toLowerCase())}`}
                  </span>
                </button>
              );
            })}

            <section className="rounded-xl p-5" style={{ background: '#15163f', border: '3px solid #7fd4ff', boxShadow: '0 5px 0 #0d0e2b' }} aria-labelledby="why-h">
              <h2 id="why-h" className="text-lg font-extrabold text-sky">
                Why {meta.label} fits
              </h2>
              <p className="mt-2 text-sm leading-snug text-cream">{reasons}</p>
              <ol className="mt-4 space-y-3">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sky font-mono text-sm font-bold text-night">{i + 1}</span>
                    <span className="text-[14px] font-bold leading-snug text-soft">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border-[3px] border-twilight bg-panel p-4 shadow-[0_5px_0_#0d0e2b]">
            <Ghost className="ghost-float shrink-0" style={{ width: 44, height: 44 }} />
            <p className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-soft">
              {archived ? (
                <>
                  {project.name} is archived. Restore it from the Archive to choose a new path.
                </>
              ) : (
                <>
                  You picked <span style={{ color: meta.accent }}>{meta.label}</span> for {project.name}. Nothing is deleted, and you can change the path later from the project timeline.
                </>
              )}
            </p>
            {archived ? (
              <Button variant="mint" onClick={() => navigate('/archive')}>
                Go to Archive
              </Button>
            ) : (
              <Button variant="sky" onClick={choose} disabled={busy || (chosen && current !== 'archive')} className="!min-h-12 !px-6">
                {chosen && current !== 'archive' ? 'Path chosen ✓' : busy ? 'Saving…' : 'Choose This Path'}
              </Button>
            )}
          </div>
        </div>
      </div>
      <ArchiveDialog project={project} open={archiving} onClose={() => setArchiving(false)} />
    </div>
  );
}
