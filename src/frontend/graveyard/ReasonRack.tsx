import { memo, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { StallReason } from '@/backend/domain/types';
import type { DragItem } from '@/frontend/dnd/DragLayer';
import { Clock, Flame, Wrench, Compass, GripVertical } from 'lucide-react';

interface ReasonDef {
  id: StallReason;
  label: string;
  shortLabel: string;
  icon: typeof Clock;
  color: string;
}

export const REASON_DEFS: ReasonDef[] = [
  { id: 'lack-of-time', label: 'Lack of Time', shortLabel: 'Time', icon: Clock, color: '#ffd166' },
  { id: 'lost-interest', label: 'Lost Interest', shortLabel: 'Interest', icon: Flame, color: '#f6b9ab' },
  { id: 'technical-difficulty', label: 'Tech Hurdle', shortLabel: 'Tech', icon: Wrench, color: '#9ce6bd' },
  { id: 'unclear-direction', label: 'Unclear Direction', shortLabel: 'Direction', icon: Compass, color: '#b995ff' },
];

export function DraggableReasonCard({ reason }: { reason: ReasonDef }) {
  const Icon = reason.icon;
  const data: DragItem = useMemo(
    () => ({
      kind: 'reason',
      label: reason.label,
      reason: reason.id,
      preview: (
        <div
          className="px-3 py-1.5 bg-[#251f4d] border-2 shadow-[0_4px_0_#14122e] flex items-center gap-2 select-none"
          style={{ borderColor: reason.color }}
        >
          <Icon className="size-3.5" style={{ color: reason.color }} />
          <span className="font-display text-sm uppercase tracking-wide text-soft">{reason.label}</span>
        </div>
      ),
    }),
    [reason],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `reason-${reason.id}`,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      title={`Drag onto any project to add "${reason.label}"`}
      className={`relative flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#1b1742] border-2 transition-all cursor-grab select-none ${
        isDragging ? 'opacity-30 scale-95 border-dashed' : 'hover:-translate-x-0.5'
      }`}
      style={{ borderColor: `${reason.color}88` }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <GripVertical className="size-3 text-dim shrink-0" />
        <Icon className="size-3.5 shrink-0" style={{ color: reason.color }} />
        <span className="font-display text-xs tracking-wider text-cream truncate uppercase">
          {reason.shortLabel}
        </span>
      </div>
      <span className="size-1.5 rounded-full" style={{ background: reason.color }} />
    </div>
  );
}

/**
 * A small "Why it stalled?" rack of 4 mini signposts at the left of the scene,
 * draggable onto any gravestone or the open project panel.
 */
export const ReasonRack = memo(function ReasonRack({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Why it stalled? Draggable reasons"
      className={`p-3 bg-[#161438]/95 border-2 border-twilight shadow-[0_6px_0_#14122e] flex flex-col gap-2 w-36 select-none ${className}`}
    >
      <div className="pb-1.5 border-b border-white/10">
        <span className="font-display text-[11px] tracking-wider text-gold block uppercase leading-none">
          WHY IT STALLED?
        </span>
        <span className="text-[9px] text-dim block mt-0.5">Drag onto any stone</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {REASON_DEFS.map((r) => (
          <DraggableReasonCard key={r.id} reason={r} />
        ))}
      </div>
    </aside>
  );
});
