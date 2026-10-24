import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyzeProject } from '../domain/analysis';
import {
  STEP_ORDER,
  draftToAnalysisInput,
  emptyDraft,
  hasErrors,
  isDraftDirty,
  validateAll,
  validateStep,
  type DraftErrors,
  type ProjectDraft,
  type StepId,
} from '../domain/draft';
import { PATHS, STALL_REASON_META, STATUS_META } from '../domain/paths';
import { navigate } from '../lib/router';
import { useProjects } from '../store/ProjectsContext';
import { Button, PageHeader, PathBadge } from '../components/ui';
import { Dialog } from '../components/Dialog';
import { InterestSection, IdeaSection, ProgressSection, StoppedSection } from '../components/ProjectForm';
import { MiniScore } from '../components/ScoreCard';
import { useSafe, useToast } from '../components/Toast';

const STEP_META: Record<StepId, { title: string; blurb: string }> = {
  idea: { title: 'The idea', blurb: 'What was it?' },
  progress: { title: 'Progress', blurb: 'What exists today?' },
  stopped: { title: 'Why it stopped', blurb: 'No judgement here.' },
  interest: { title: 'Current interest', blurb: 'How do you feel about it now?' },
};

export function LogProjectPage() {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [draft, setDraft] = useState<ProjectDraft>(() => emptyDraft());
  const [errors, setErrors] = useState<DraftErrors>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [reached, setReached] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const step = STEP_ORDER[stepIndex];
  const last = stepIndex === STEP_ORDER.length - 1;
  const analysis = useMemo(() => analyzeProject(draftToAnalysisInput(draft, reached >= 1)), [draft, reached]);

  const onChange = (patch: Partial<ProjectDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch).forEach((k) => delete next[k as keyof ProjectDraft]);
      return next;
    });
  };

  const goTo = (i: number) => {
    setStepIndex(i);
    setReached((r) => Math.max(r, i));
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    const errs = validateStep(step, draft);
    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }
    goTo(stepIndex + 1);
  };

  const save = async () => {
    const problem = validateAll(draft);
    if (problem) {
      setErrors(problem.errors);
      goTo(STEP_ORDER.indexOf(problem.step));
      toast.error('One more thing', 'Please fix the highlighted field, then save.');
      return;
    }
    setSaving(true);
    const project = await safe(() => actions.create(draft), 'Could not save your project');
    setSaving(false);
    if (project) {
      toast.success('Project logged', `"${project.name}" is in your graveyard. Here is what Relaunch thinks.`);
      navigate(`/projects/${project.id}`);
    }
  };

  const cancel = () => (isDraftDirty(draft) ? setConfirmCancel(true) : navigate('/projects'));
  const props = { draft, errors, onChange };
  const rec = analysis.recommendation?.path;

  return (
    <>
      <PageHeader title="Log a project" subtitle="Four short steps, about two minutes. You can edit anything later." />

      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress through the form">
        {STEP_ORDER.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s} aria-current={current ? 'step' : undefined}>
              <button
                type="button"
                disabled={i > reached}
                onClick={() => i <= reached && goTo(i)}
                className={`flex min-h-11 w-full flex-col items-start gap-0.5 rounded-md border-2 p-2 text-left ${current ? 'border-night bg-gold' : done ? 'border-twilight bg-[#ece7fb]' : 'border-line bg-white'} disabled:cursor-default`}
              >
                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  {done ? <Check aria-hidden className="size-3.5" /> : <span aria-hidden>{i + 1}</span>}
                  <span className="sr-only">Step {i + 1}:</span>
                </span>
                <span className="hidden text-xs font-extrabold sm:block">{STEP_META[s].title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            last ? save() : next();
          }}
          noValidate
          className="rl-panel space-y-6 p-5 sm:p-6"
        >
          <header>
            <p className="pixel-label text-twilight">
              Step {stepIndex + 1} of {STEP_ORDER.length}
            </p>
            <h2 className="mt-1 text-xl font-extrabold" tabIndex={-1} id="step-title">
              {STEP_META[step].title}
            </h2>
          </header>

          {step === 'idea' && <IdeaSection {...props} />}
          {step === 'progress' && <ProgressSection {...props} />}
          {step === 'stopped' && <StoppedSection {...props} />}
          {step === 'interest' && (
            <>
              <InterestSection {...props} />
              <section aria-labelledby="review" className="rounded-md border-2 border-line bg-white p-4">
                <h3 id="review" className="text-sm font-extrabold uppercase tracking-wide text-twilight">
                  Review before saving
                </h3>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                  <dt className="font-extrabold">Project</dt>
                  <dd>{draft.name} · {draft.domain}</dd>
                  <dt className="font-extrabold">Progress</dt>
                  <dd>{draft.progress}%</dd>
                  <dt className="font-extrabold">Why it stopped</dt>
                  <dd>{draft.stallReason ? STALL_REASON_META[draft.stallReason].label : '—'}</dd>
                  <dt className="font-extrabold">Status</dt>
                  <dd>{STATUS_META[draft.status].label}</dd>
                </dl>
              </section>
            </>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-line pt-4">
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <Button onClick={() => goTo(stepIndex - 1)}>
                  <ChevronLeft aria-hidden className="size-4" /> Back
                </Button>
              )}
              <Button type="submit" variant="gold" disabled={saving}>
                {last ? (saving ? 'Saving…' : 'Create project') : 'Continue'}
                {!last && <ChevronRight aria-hidden className="size-4" />}
              </Button>
            </div>
          </footer>
        </form>

        <aside aria-label="Live Relaunch Score preview" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rl-panel space-y-3 p-4">
            <h2 className="pixel-label text-twilight">Live score</h2>
            <MiniScore analysis={analysis} />
            {rec && (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                Right now we would suggest <PathBadge path={rec} />
              </p>
            )}
            {rec && <p className="text-xs text-muted">{PATHS[rec].tagline}</p>}
          </div>
        </aside>
      </div>

      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        size="sm"
        title="Leave without saving?"
        description="What you have entered so far will be lost."
        footer={
          <>
            <Button variant="gold" onClick={() => setConfirmCancel(false)} data-autofocus>
              Keep editing
            </Button>
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              Discard and leave
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Nothing has been saved yet. You can always log this project later.</p>
      </Dialog>
    </>
  );
}
