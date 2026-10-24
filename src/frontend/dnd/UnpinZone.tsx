import { useCallback } from 'react';
import type { StallReason } from '@/backend/domain/types';
import { STALL_REASON_META } from '@/backend/domain/paths';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useToast } from '@/frontend/ui/Toast';
import { DropZone } from './DropZone';
import { useActiveDrag, type DragItem } from './DragLayer';

const accepts = (i: DragItem) => i.kind === 'reason-chip';

/**
 * Where a pinned reason chip goes to be taken off its project. It only appears while one of that project's chips
 * is being dragged, so there is no remove button anywhere.
 */
export function UnpinZone({ projectId }: { projectId: string }) {
  const active = useActiveDrag();
  const { actions } = useProjects();
  const toast = useToast();
  const drop = useCallback(
    (i: DragItem) => {
      if (!i.reason || i.projectId !== projectId) return;
      const r: StallReason = i.reason;
      void actions.removeReason(projectId, r).then(() => toast.info(`Removed “${STALL_REASON_META[r]?.label ?? r}”`, undefined, { label: 'Undo', run: () => void actions.undo() }));
    },
    [actions, projectId, toast],
  );
  const sameProject = useCallback((i: DragItem) => accepts(i) && i.projectId === projectId, [projectId]);
  if (!active || !accepts(active) || active.projectId !== projectId) return null;
  return <DropZone id={`unpin-${projectId}`} label="SHAKE IT OFF" description="Take this reason off the project" color="#EDB0D5" accepts={sameProject} onDrop={drop} idleHint="" width="calc(100% - 8px)" height={64} />;
}
