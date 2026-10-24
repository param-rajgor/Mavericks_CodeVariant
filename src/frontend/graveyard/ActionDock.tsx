import { memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { PathId } from '@/backend/domain/types';
import { PATHS } from '@/backend/domain/paths';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useSafe, useToast } from '@/frontend/ui/Toast';
import { useChrome } from '@/frontend/shell/AppChrome';
import { DropZone } from '@/frontend/dnd/DropZone';
import { useActiveDrag, type DragItem } from '@/frontend/dnd/DragLayer';
import { LANTERN_ICON, PATH_ICONS } from '@/frontend/dnd/icons';
import { CONTROL_BAR_H } from './ControlBar';

const PATH_ORDER: PathId[] = ['continue', 'restart', 'pivot', 'repurpose', 'archive'];
const isStone = (i: DragItem) => i.kind === 'stone';

/**
 * The six Action Zones of the graveyard. Hidden until a stone is picked up, then it slides up just above the
 * bottom bar. LOOK CLOSER opens the full detail view; the five paths decide the project's fate.
 */
export const ActionDock = memo(function ActionDock({ onSink }: { onSink: (id: string) => void }) {
  const active = useActiveDrag();
  const { actions } = useProjects();
  const { openDetail } = useChrome();
  const safe = useSafe();
  const toast = useToast();
  const open = !!active && isStone(active);

  const look = useCallback((i: DragItem) => i.projectId && openDetail(i.projectId), [openDetail]);
  const decide = useCallback(
    async (path: PathId, i: DragItem) => {
      if (!i.projectId) return;
      if (path === 'archive' || path === 'repurpose') onSink(i.projectId);
      const saved = await safe(() => actions.decide(i.projectId!, path), 'Could not save that decision');
      if (saved) toast.success(`${saved.name} → ${PATHS[path].label}`, undefined, { label: 'Undo', run: () => void actions.undo() });
    },
    [actions, onSink, safe, toast],
  );

  return createPortal(
    <div className={`action-dock${open ? ' action-dock--open' : ''}`} style={{ bottom: CONTROL_BAR_H + 12 }} aria-hidden={!open}>
      <div className="action-dock__title">{active ? `Where should ${active.label} go?` : 'Drop a stone here'}</div>
      <DropZone id="zone-look" label="LOOK CLOSER" description="Look closer: open the full story" color="#FFD166" icon={LANTERN_ICON} accepts={isStone} onDrop={look} />
      {PATH_ORDER.map((p) => (
        <PathZone key={p} path={p} onDecide={decide} />
      ))}
    </div>,
    document.body,
  );
});

const PathZone = memo(function PathZone({ path, onDecide }: { path: PathId; onDecide: (p: PathId, i: DragItem) => void }) {
  const meta = PATHS[path];
  // an archived stone cannot be archived again
  const accepts = useCallback((i: DragItem) => isStone(i) && !(path === 'archive' && i.archived), [path]);
  const drop = useCallback((i: DragItem) => onDecide(path, i), [onDecide, path]);
  return <DropZone id={`zone-${path}`} label={meta.label.toUpperCase()} description={`${meta.label}: ${meta.tagline}`} color={meta.accent} icon={PATH_ICONS[path]} accepts={accepts} onDrop={drop} />;
});
