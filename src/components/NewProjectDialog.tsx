import { useEffect, useMemo, useState } from 'react';
import { analyzeProject } from '../domain/analysis';
import { draftToAnalysisInput, emptyDraft, type ProjectDraft } from '../domain/draft';
import { ASSET_META, DOMAIN_LIST, INTEREST_LABELS, OPEN_STATUSES, STALL_REASON_META, STATUS_META } from '../domain/paths';
import { ASSET_CATEGORIES, STALL_REASONS, type AssetCategory, type StallReason } from '../domain/types';
import { daysAgoStr, todayStr } from '../domain/dates';
import { useProjects } from '../store/ProjectsContext';
import { Dialog } from './Dialog';
import { Button, Field, Group } from './ui';
import { useSafe, useToast } from './Toast';
import { useShell } from './shellContext';

const STEPS = 3;

/** Quick "last worked" choices, so nobody has to type a date. */
const WHEN: Array<{ label: string; days: number | null }> = [
  { label: 'Not sure', days: null },
  { label: 'This week', days: 3 },
  { label: 'This month', days: 20 },
  { label: '1–3 months ago', days: 60 },
  { label: '3–6 months ago', days: 135 },
  { label: 'Over 6 months ago', days: 240 },
];

/**
 * Three gentle steps. Only the name is required; everything else is optional, and a missing detail
 * simply makes the Relaunch Score provisional instead of blocking the project.
 */
export function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const { openDetail } = useShell();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProjectDraft>(() => emptyDraft());
  const [when, setWhen] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft({ ...emptyDraft(), progress: 0, domain: 'Software' });
      setWhen(null);
      setTouched(false);
    }
  }, [open]);

  const set = (patch: Partial<ProjectDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const nameError = !draft.name.trim() ? 'Give it a name so you can find it later.' : draft.name.trim().length > 80 ? 'Keep the name under 80 characters.' : undefined;

  const analysis = useMemo(() => analyzeProject(draftToAnalysisInput({ ...draft, assets: draft.assets }, true)), [draft]);

  const next = () => {
    if (step === 0 && nameError) {
      setTouched(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (nameError) {
      setStep(0);
      setTouched(true);
      return;
    }
    setBusy(true);
    const saved = await safe(
      () =>
        actions.create({
          ...draft,
          lastWorkedAt: when == null ? '' : daysAgoStr(when),
          startedAt: todayStr(),
        }),
      'Could not save that project',
    );
    setBusy(false);
    if (saved) {
      toast.success(`${saved.name} added to your graveyard`, undefined, { label: 'View', run: () => openDetail(saved.id) });
      onClose();
    }
  };

  const toggleAsset = (a: AssetCategory) => set({ assets: draft.assets.includes(a) ? draft.assets.filter((x) => x !== a) : [...draft.assets, a] });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title="New Project"
      description={<span className="font-mono text-xs font-bold tracking-wider text-gold">{`STEP ${step + 1} OF ${STEPS}`}</span>}
      footer={
        <>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS - 1 ? (
            <Button variant="gold" onClick={next}>
              Next
            </Button>
          ) : (
            <Button variant="gold" onClick={submit} disabled={busy}>
              {busy ? 'Saving…' : 'Add to graveyard'}
            </Button>
          )}
        </>
      }
    >
      <div className="mb-5 flex gap-2" role="progressbar" aria-label="Progress through the form" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1}>
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className="h-3 flex-1 rounded-sm" style={{ background: i <= step ? '#3ddc84' : '#2b2a6d' }} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <Field label="What is it called?" error={touched ? nameError : undefined}>
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                data-autofocus
                className="rl-input"
                maxLength={80}
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), next())}
                placeholder="e.g. Recipe Remix"
              />
            )}
          </Field>
          <Field label="Why did it stall?" optional>
            {({ id }) => (
              <select id={id} className="rl-input" value={draft.stallReason} onChange={(e) => set({ stallReason: e.target.value as StallReason | '' })}>
                <option value="">I’m not sure yet</option>
                {STALL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {STALL_REASON_META[r].label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Field label={`How far did you get? ${draft.progress ?? 0}%`}>
            {({ id }) => (
              <input id={id} type="range" min={0} max={100} step={5} value={draft.progress ?? 0} onChange={(e) => set({ progress: Number(e.target.value) })} className="h-11 w-full accent-[#a982f2]" />
            )}
          </Field>
          <Field label="When did you last work on it?" optional>
            {({ id }) => (
              <select id={id} className="rl-input" value={when ?? ''} onChange={(e) => setWhen(e.target.value === '' ? null : Number(e.target.value))}>
                {WHEN.map((w) => (
                  <option key={w.label} value={w.days ?? ''}>
                    {w.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Group legend="How much do you still want this to exist?">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="rl-chipbtn" aria-pressed={draft.currentInterest === n} onClick={() => set({ currentInterest: n })}>
                  {n} · {INTEREST_LABELS[n].label}
                </button>
              ))}
            </div>
          </Group>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Field label="What was the idea?" optional>
            {({ id }) => <textarea id={id} className="rl-input" rows={2} maxLength={600} value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder="A sentence or two is plenty." />}
          </Field>
          <Group legend="What could be reused?" hint="Pick any that exist today.">
            <div className="flex flex-wrap gap-2">
              {ASSET_CATEGORIES.map((a) => (
                <button key={a} type="button" className="rl-chipbtn" aria-pressed={draft.assets.includes(a)} onClick={() => toggleAsset(a)}>
                  {ASSET_META[a].label}
                </button>
              ))}
            </div>
          </Group>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              {({ id }) => (
                <select id={id} className="rl-input" value={draft.domain} onChange={(e) => set({ domain: e.target.value as ProjectDraft['domain'] })}>
                  {DOMAIN_LIST.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Where is it now?">
              {({ id }) => (
                <select id={id} className="rl-input" value={draft.status} onChange={(e) => set({ status: e.target.value as ProjectDraft['status'] })}>
                  {OPEN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-night p-4 shadow-[inset_0_0_0_3px_#3b3585]">
            <div>
              <p className="font-extrabold text-soft">Relaunch Score</p>
              <p className="mt-1 max-w-[16rem] text-xs text-dim">
                {analysis.status === 'complete'
                  ? 'A guide built from five visible factors. It is not a prediction.'
                  : analysis.status === 'provisional'
                    ? '* Provisional. Add the missing details to complete the score.'
                    : 'Add progress and a reason to see a score.'}
              </p>
            </div>
            <span className="font-pixel text-2xl text-gold" aria-label={analysis.total == null ? 'No score yet' : `Score ${analysis.total}${analysis.status === 'provisional' ? ', provisional' : ''}`}>
              {analysis.total == null ? '—' : `${analysis.total}${analysis.status === 'provisional' ? '*' : ''}`}
            </span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
