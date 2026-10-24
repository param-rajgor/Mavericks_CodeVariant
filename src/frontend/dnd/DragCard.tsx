import { memo, type CSSProperties, type ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DragItem } from './DragLayer';

/**
 * Any data card that can be picked up: a repo, a task, a token. It leaves a dashed slot behind while it is away,
 * and shows a grab cursor. Children can still hold links; only a press that moves 6px starts a drag.
 */
export const DragCard = memo(function DragCard({ id, item, className = '', style, children, disabled }: { id: string; item: DragItem; className?: string; style?: CSSProperties; children: ReactNode; disabled?: boolean }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, data: item, disabled });
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} data-draggable={disabled ? undefined : ''} aria-roledescription="draggable card" className={`${className} ${isDragging ? 'ghost-slot' : ''}`}>
      {children}
    </div>
  );
});

/** What follows the pointer: a small card with a title and a hint. */
export function CardPreview({ title, hint, color = '#ffd166' }: { title: string; hint?: string; color?: string }) {
  return (
    <div style={{ minWidth: 190, maxWidth: 280, padding: '10px 14px', background: '#1e1c48', border: `4px solid ${color}`, boxShadow: '0 6px 0 #14122e' }}>
      <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, color }}>{title}</span>
      {hint && <span style={{ display: 'block', marginTop: 4, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>{hint}</span>}
    </div>
  );
}
