import { memo, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DragItem } from '@/frontend/dnd/DragLayer';
import { PixelSprite, SPROUT } from '@/frontend/ui/PixelSprite';
import { GripVertical } from 'lucide-react';

interface SeedPacketProps {
  onClick?: () => void;
  className?: string;
}

export const SeedPacket = memo(function SeedPacket({ onClick, className = '' }: SeedPacketProps) {
  const data: DragItem = useMemo(
    () => ({
      kind: 'seed',
      label: 'Seed Packet',
      preview: (
        <div className="p-3 bg-[#2a2456] border-4 border-mint shadow-[0_6px_0_#14122e] flex items-center gap-3">
          <PixelSprite sprite={SPROUT} px={3} />
          <div>
            <span className="font-display text-xl text-mint block leading-tight">SEED PACKET</span>
            <span className="text-[10px] text-cream block">Drop on Planting Plot</span>
          </div>
        </div>
      ),
    }),
    [],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: 'draggable-seed-packet',
    data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      title="Drag to planting plot or click to plant a project"
      className={`relative inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#25204d] border-2 border-mint/70 hover:border-mint shadow-[0_3px_0_#14122e] cursor-grab select-none transition-all ${
        isDragging ? 'opacity-30 scale-95' : 'hover:-translate-y-0.5'
      } ${className}`}
    >
      <GripVertical className="size-3.5 text-mint/60" />
      <PixelSprite sprite={SPROUT} px={2} />
      <div className="flex flex-col text-left">
        <span className="font-display text-lg tracking-wider text-mint leading-none">+ SEED PACKET</span>
        <span className="text-[9px] font-display text-gold leading-none mt-0.5 uppercase tracking-wide">
          DRAG TO SOW
        </span>
      </div>
    </div>
  );
});
