import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PixelSprite, type SpriteDef } from '@/frontend/ui/PixelSprite';
import { useActiveDrag, type DragItem, type ZoneData } from './DragLayer';

interface DropZoneProps {
  id: string;
  /** Short name in Jersey 15, e.g. "RESTART". */
  label: string;
  /** What the zone does, read by screen readers ("Restart this project"). */
  description: string;
  color: string;
  icon?: SpriteDef;
  accepts: (item: DragItem) => boolean;
  onDrop: (item: DragItem) => void;
  /** Shown when nothing is being dragged. */
  idleHint?: string;
  width?: number | string;
  height?: number;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Eight to ten pixel sparks that burst out of a zone in its own colour when something lands. */
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { dx: Math.round(Math.cos(a) * 46), dy: Math.round(Math.sin(a) * 34) };
});

/**
 * An Action Zone. While a matching item is dragged it pulses; items it does not take dim it to 40%.
 * Hovering brightens it, lifts it 4px, gives it a gold border, bounces its icon and reads "Drop to …".
 */
export const DropZone = memo(function DropZone({ id, label, description, color, icon, accepts, onDrop, idleHint = 'Drop a stone here', width = 150, height = 110, style, children }: DropZoneProps) {
  const active = useActiveDrag();
  const [burst, setBurst] = useState(0);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleDrop = useCallback(
    (item: DragItem) => {
      setBurst((b) => b + 1);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setBurst(0), 600);
      onDrop(item);
    },
    [onDrop],
  );
  const data = useMemo<ZoneData>(() => ({ label: description, accepts, onDrop: handleDrop }), [description, accepts, handleDrop]);
  const valid = !!active && accepts(active);
  const { setNodeRef, isOver } = useDroppable({ id, data, disabled: !!active && !valid });
  const over = isOver && valid;
  const state = !active ? 'idle' : !valid ? 'invalid' : over ? 'over' : 'valid';

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone drop-zone--${state}`}
      aria-label={description}
      style={{ ['--zone' as string]: color, width, height, ...style }}
    >
      <div className="drop-zone__inner">
        {icon && (
          <span key={over ? 'b' : 'r'} className={over ? 'drop-zone__icon drop-zone__icon--bounce' : 'drop-zone__icon'}>
            <PixelSprite sprite={icon} px={3} />
          </span>
        )}
        <span className="drop-zone__label">{over ? `DROP TO ${label}` : label}</span>
        {!active && idleHint && <span className="drop-zone__hint">{idleHint}</span>}
        {children}
      </div>
      {burst > 0 && (
        <span key={burst} aria-hidden="true" className="drop-zone__burst">
          {SPARKS.map((s, i) => (
            <i key={i} style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px` }} />
          ))}
        </span>
      )}
    </div>
  );
});
