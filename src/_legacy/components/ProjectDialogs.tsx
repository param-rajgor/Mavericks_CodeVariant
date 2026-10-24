import { useEffect, useState } from 'react';
import type { OpenStatus, Project } from '../domain/types';
import { OPEN_STATUSES, STATUS_META } from '../domain/paths';
import { hasErrors, projectToDraft, validateAll, type DraftErrors, type ProjectDraft } from '../domain/draft';
import { useProjects } from '../store/ProjectsContext';
import { Dialog } from './Dialog';
import { Button, Field } from './ui';
import { IdeaSection, InterestSection, ProgressSection, StoppedSection } from './ProjectForm';
import { useSafe, useToast } from './Toast';
import { navigate } from '../lib/router';

interface Common {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function ArchiveDialog({ project, open, onClose }: Common) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [note, setNote] = useState(project.archiveNote);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setNote(project.archiveNote);
  }, [open, project.archiveNote]);

  const submit = async () => {
    setBusy(true);
    const saved = await safe(() => actions.archive(project.id, note), 'Could not archive');
    setBusy(false);
    if (saved) {
      toast.success('Archived with care', `"${project.name}" is in your archive. You can restore it any time.`);
      onClose();
      navigate('/archive');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Archive “${project.name}”?`}
      description="Archiving is not deleting. Everything is kept: the history, your assets, and your notes. It simply moves out of your active list."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button variant="rose" onClick={submit} disabled={busy}>
            {busy ? 'Archiving…' : 'Archive with a note'}
          </Button>
        </>
      }
    >
      <Field label="What did you learn, or why are you letting go?" hint="Optional. Future you will be glad of it." optional>
        {({ id, describedBy }) => <textarea id={id} aria-describedby={describedBy} data-autofocus className="rl-input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. A template did the job. I'm keeping the type scale." />}
      </Field>
    </Dialog>
  );
}

export function RestoreDialog({ project, open, onClose, onDone }: Common & { onDone?: () => void }) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [status, setStatus] = useState<OpenStatus>(project.previousStatus ?? 'stalled');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const saved = await safe(() => actions.restore(project.id, status), 'Could not restore');
    setBusy(false);
    if (saved) {
      toast.success('Welcome back', `"${project.name}" is ${STATUS_META[status].label.toLowerCase()} again. Its history is intact.`);
      onClose();
      onDone?.();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Restore “${project.name}”`}
      description="Choose where it should stand now. Its history, assets and archive note are all preserved."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={busy}>
            {busy ? 'Restoring…' : 'Restore project'}
          </Button>
        </>
      }
    >
      <Field label="Restore as">
        {({ id }) => (
          <select id={id} data-autofocus className="rl-input" value={status} onChange={(e) => setStatus(e.target.value as OpenStatus)}>
            {OPEN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}: {STATUS_META[s].definition}
              </option>
            ))}
          </select>
        )}
      </Field>
    </Dialog>
  );
}

export function DeleteDialog({ project, open, onClose, onDone }: Common & { onDone?: () => void }) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const ok = await safe(async () => {
      await actions.remove(project.id);
      return true;
    }, 'Could not delete');
    setBusy(false);
    if (ok) {
      toast.success('Project deleted', `"${project.name}" was removed from this device.`);
      onClose();
      onDone?.();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Permanently delete “${project.name}”?`}
      description="This removes the project and its whole history from this device. It cannot be undone. If you only want it out of the way, archive it instead."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            Keep it
          </Button>
          <Button variant="rose" onClick={submit} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">Tip: a backup from the “Your data” page keeps a copy you can restore later.</p>
    </Dialog>
  );
}

export function ProgressDialog({ project, open, onClose }: Common) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [value, setValue] = useState(project.progress);
  const [today, setToday] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setValue(project.progress);
      setToday(true);
    }
  }, [open, project.progress]);

  const submit = async () => {
    setBusy(true);
    const saved = await safe(() => actions.setProgress(project.id, value, today), 'Could not update progress');
    setBusy(false);
    if (saved) {
      toast.success('Progress updated', `${project.name} is at ${value}%.`);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Update progress"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Save progress'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={`Progress: ${value}%`}>
          {({ id }) => <input id={id} data-autofocus type="range" min={0} max={100} step={5} value={value} onChange={(e) => setValue(Number(e.target.value))} className="h-11 w-full accent-twilight" />}
        </Field>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold">
          <input type="checkbox" checked={today} onChange={(e) => setToday(e.target.checked)} className="size-4 accent-twilight" />
          I worked on this today (updates freshness)
        </label>
      </div>
    </Dialog>
  );
}

export function EditDialog({ project, open, onClose }: Common) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const [draft, setDraft] = useState<ProjectDraft>(() => projectToDraft(project));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(projectToDraft(project));
      setErrors({});
    }
  }, [open, project]);

  const onChange = (patch: Partial<ProjectDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch).forEach((k) => delete next[k as keyof ProjectDraft]);
      return next;
    });
  };

  const submit = async () => {
    const problem = validateAll(draft);
    if (problem) {
      setErrors(problem.errors);
      toast.error('Please check the highlighted fields', 'Some details need a quick fix before saving.');
      return;
    }
    setBusy(true);
    const saved = await safe(() => actions.edit(project.id, draft), 'Could not save your changes');
    setBusy(false);
    if (saved) {
      toast.success('Changes saved');
      onClose();
    }
  };

  const archived = project.status === 'archived';
  const props = { draft, errors, onChange };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit project"
      description="Changes are saved to this device and the score is recalculated."
      lockBackdrop
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <section aria-labelledby="e1" className="space-y-4">
          <h3 id="e1" className="text-sm font-extrabold uppercase tracking-wide text-twilight">The idea</h3>
          <IdeaSection {...props} />
        </section>
        <section aria-labelledby="e2" className="space-y-4">
          <h3 id="e2" className="text-sm font-extrabold uppercase tracking-wide text-twilight">Progress and assets</h3>
          <ProgressSection {...props} />
        </section>
        <section aria-labelledby="e3" className="space-y-4">
          <h3 id="e3" className="text-sm font-extrabold uppercase tracking-wide text-twilight">Why it stopped</h3>
          <StoppedSection {...props} showStatus={!archived} />
        </section>
        <section aria-labelledby="e4" className="space-y-4">
          <h3 id="e4" className="text-sm font-extrabold uppercase tracking-wide text-twilight">Current interest</h3>
          <InterestSection {...props} />
        </section>
        {hasErrors(errors) && <p role="alert" className="text-sm font-bold text-[#a23a0a]">Some fields above need attention.</p>}
      </div>
    </Dialog>
  );
}
