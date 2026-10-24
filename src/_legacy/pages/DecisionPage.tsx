import { useEffect, useState } from 'react';
import { Check, Info } from 'lucide-react';
import { analyzeProject, projectToInput, stepsForPath } from '../domain/analysis';
import { PATH_LIST, PATHS } from '../domain/paths';
import type { PathId } from '../domain/types';
import { formatDate } from '../domain/dates';
import { useProjects } from '../store/ProjectsContext';
import { Button, LinkButton, PageHeader, PathBadge, SectionTitle } from '../components/ui';
import { PATH_ICONS } from '../components/ui';
import { FactorBreakdown, ScoreRing, ScoreStatusLabel } from '../components/ScoreCard';
import { ArchiveDialog } from '../components/ProjectDialogs';
import { MissingProject } from './ProjectDetailPage';
import { useSafe, useToast } from '../components/Toast';

export function DecisionPage({ id }: { id: string }) {
  const { get, actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const project = get(id);
  const [viewing, setViewing] = useState<PathId | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const suggested = project ? analyzeProject(projectToInput(project)).recommendation?.path ?? null : null;
  useEffect(() => {
    if (project && viewing == null) setViewing(project.selectedPath ?? suggested ?? 'continue');
  }, [project, suggested, viewing]);

  if (!project) return <MissingProject />;

  const analysis = analyzeProject(projectToInput(project));
  const rec = analysis.recommendation;
  const current = viewing ?? 'continue';
  const meta = PATHS[current];
  const chosen = project.selectedPath;
  const archived = project.status === 'archived';
  const steps = rec && rec.path === current ? analysis.nextSteps : stepsForPath(projectToInput(project), current);

  const choose = async () => {
    if (current === 'archive') {
      setArchiveOpen(true);
      return;
    }
    setBusy(true);
    const saved = await safe(() => actions.choosePath(project.id, current), 'Could not save your choice');
    setBusy(false);
    if (saved) toast.success(`Path chosen: ${meta.label}`, 'Recorded in your timeline. You can change your mind later.');
  };

  return (
    <>
      <PageHeader
        title="Decision"
        eyebrow={project.name}
        subtitle="Here is how your project scores, what we would suggest, and the first three steps. You decide."
        actions={<LinkButton to={`/projects/${project.id}`}>Back to project</LinkButton>}
      />

      {chosen && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-[#ece7fb] p-3 text-sm font-bold" role="status">
          <Check aria-hidden className="size-4" /> You chose <PathBadge path={chosen} /> {archived && project.archivedAt ? `on ${formatDate(project.archivedAt)}` : ''}. You can change your decision below.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rl-panel p-5" aria-labelledby="score-h">
          <div className="flex flex-wrap items-center gap-5">
            <ScoreRing analysis={analysis} size={150} />
            <div className="space-y-2">
              <h2 id="score-h" className="text-lg font-extrabold">Relaunch Score</h2>
              <ScoreStatusLabel analysis={analysis} />
              {analysis.warnings.map((w) => (
                <p key={w} className="flex gap-2 text-xs text-muted">
                  <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" /> {w}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <SectionTitle>How it adds up</SectionTitle>
            <FactorBreakdown analysis={analysis} />
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="rec-h">
          <div className="rl-panel p-5">
            <h2 id="rec-h" className="text-lg font-extrabold">Our suggestion</h2>
            {rec ? (
              <div className="mt-2 space-y-3">
                <PathBadge path={rec.path} size="md" />
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {rec.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {rec.alternatives.length > 0 ? (
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    Could also make sense: {rec.alternatives.map((a) => <PathBadge key={a} path={a} />)}
                  </p>
                ) : (
                  <p className="text-sm text-muted">No other path came close.</p>
                )}
                <p className="text-xs text-muted">{rec.caveat}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">We need a little more information before suggesting a path. Edit the project to add progress and why it stopped. You can still choose any path below.</p>
            )}
          </div>

          <div className="rl-panel p-5">
            <h2 className="text-lg font-extrabold">Choose a path</h2>
            <div role="radiogroup" aria-label="Relaunch paths" className="mt-3 grid gap-2">
              {PATH_LIST.map((p) => {
                const Icon = PATH_ICONS[p.id];
                const on = current === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setViewing(p.id)}
                    className="flex min-h-11 items-center gap-3 rounded-md border-[3px] p-3 text-left"
                    style={{ background: on ? p.soft : '#fff', borderColor: on ? p.ink : p.accent, color: p.ink }}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-sm" style={{ background: p.accent }}>
                      <Icon aria-hidden className="size-5" style={{ color: '#17183E' }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold">
                        {p.label}
                        {rec?.path === p.id && <span className="ml-2 chip !bg-white !text-night">Suggested</span>}
                        {chosen === p.id && <span className="ml-2 chip !bg-night !text-soft">Chosen</span>}
                      </span>
                      <span className="block text-xs text-night/80">{p.verb}: {p.bestWhen}</span>
                    </span>
                    {on && <Check aria-hidden className="size-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-md p-4" style={{ background: meta.soft, color: meta.ink }}>
              <h3 className="text-sm font-extrabold">First three steps for {meta.label}</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              {current === 'archive' && <p className="mt-2 text-xs">Archiving is a proper ending. You will be able to add a note about what you learned.</p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" onClick={choose} disabled={busy || chosen === current || archived}>
                {chosen === current ? `${meta.label} is your path` : busy ? 'Saving…' : chosen ? `Change to ${meta.label}` : 'Choose This Path'}
              </Button>
              {archived && <p className="self-center text-sm text-muted">This project is archived. Restore it from its page to choose a different path.</p>}
            </div>
          </div>
        </section>
      </div>

      <ArchiveDialog project={project} open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </>
  );
}
