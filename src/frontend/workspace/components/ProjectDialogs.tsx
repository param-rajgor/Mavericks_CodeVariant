import { useEffect, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { OpenStatus, Project } from '@/backend/domain/types';
import { OPEN_STATUSES, STATUS_META } from '@/backend/domain/paths';
import { hasErrors, projectToDraft, validateAll, type DraftErrors, type ProjectDraft } from '@/backend/domain/draft';
import { useProjects } from '@/backend/store/ProjectsContext';
import { Dialog } from '@/frontend/ui/Dialog';
import { Button, Field } from '@/frontend/ui/primitives';
import { IdeaSection, InterestSection, ProgressSection, StoppedSection } from '@/frontend/workspace/components/ProjectForm';
import { useSafe, useToast } from '@/frontend/ui/Toast';
import { navigate } from '@/frontend/routing/router';
import { useChrome } from '@/frontend/shell/AppChrome';
import { DragLayer, type DragItem } from '@/frontend/dnd/DragLayer';
import { DropZone } from '@/frontend/dnd/DropZone';
import { GripVertical } from 'lucide-react';

interface Common {
  project: Project;
  open: boolean;
  onClose: () => void;
}

function DraggableBlueprintCard({ name }: { name: string }) {
  const data: DragItem = useMemo(
    () => ({
      kind: 'card',
      label: name || 'Project Blueprint',
      preview: (
        <div className="p-3 bg-[#1e1c48] border-2 border-gold shadow-[0_4px_0_#14122e] text-center min-w-[160px]">
          <span className="font-display text-lg text-gold block leading-tight">{name || 'Blueprint'}</span>
          <span className="text-[10px] text-cream block uppercase">Drop on SAVE STAMP</span>
        </div>
      ),
    }),
    [name],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: 'edit-blueprint-card',
    data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      className={`px-3 py-2 bg-[#25204d] border-2 border-gold shadow-[0_3px_0_#14122e] flex items-center gap-2 cursor-grab select-none transition-all ${
        isDragging ? 'opacity-30 scale-95' : 'hover:-translate-y-0.5'
      }`}
    >
      <GripVertical className="size-4 text-gold shrink-0" />
      <div>
        <span className="font-display text-base text-gold block leading-none">{name || 'Blueprint'}</span>
        <span className="text-[10px] text-cream block uppercase leading-none mt-0.5">Drag to Save Stamp</span>
      </div>
    </div>
  );
}

function EditDialogContent({ project, open, onClose }: Common) {
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
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {/* Canvas Protocol Audit #9: Draggable blueprint card -> SAVE stamp zone */}
          <div className="flex items-center gap-3">
            <DraggableBlueprintCard name={draft.name || project.name} />
            <DropZone
              id="edit-save-zone"
              label="SAVE STAMP"
              description="Drop blueprint here to save edits"
              color="#ffd166"
              accepts={(i) => i.kind === 'card'}
              onDrop={submit}
              idleHint="Drop to save"
              width={140}
              height={70}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <section aria-labelledby="e1" className="space-y-4">
          <h3 id="e1" className="text-sm font-extrabold uppercase tracking-wide text-gold">The idea</h3>
          <IdeaSection {...props} />
        </section>
        <section aria-labelledby="e2" className="space-y-4">
          <h3 id="e2" className="text-sm font-extrabold uppercase tracking-wide text-gold">Progress and assets</h3>
          <ProgressSection {...props} />
        </section>
        <section aria-labelledby="e3" className="space-y-4">
          <h3 id="e3" className="text-sm font-extrabold uppercase tracking-wide text-gold">Why it stopped</h3>
          <StoppedSection {...props} showStatus={!archived} />
        </section>
        <section aria-labelledby="e4" className="space-y-4">
          <h3 id="e4" className="text-sm font-extrabold uppercase tracking-wide text-gold">Current interest</h3>
          <InterestSection {...props} />
        </section>
        {hasErrors(errors) && <p role="alert" className="text-sm font-bold text-rose">Some fields above need attention.</p>}
      </div>
    </Dialog>
  );
}

export function EditDialog(props: Common) {
  if (!props.open) return null;
  return (
    <DragLayer>
      <EditDialogContent {...props} />
    </DragLayer>
  );
}
