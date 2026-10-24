import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import type { StallReason } from '@/backend/domain/types';

/**
 * Canvas Protocol: every primary action is a drag of a data card onto an Action Zone. This file is the one
 * drag layer for a page: sensors, collision rules, the floating preview, screen-reader announcements, and
 * the hand-off from a drop to the zone that received it.
 */

export type DragKind = 'stone' | 'reason' | 'reason-chip' | 'seed' | 'seed-card' | 'card';

export interface DragItem {
  kind: DragKind;
  /** What a screen reader hears, e.g. "SocialPulse". */
  label: string;
  /** What follows the pointer. */
  preview: ReactNode;
  projectId?: string;
  archived?: boolean;
  reason?: StallReason;
}

export interface ZoneData {
  label: string;
  accepts: (item: DragItem) => boolean;
  onDrop: (item: DragItem) => void;
}

const ActiveCtx = createContext<DragItem | null>(null);
/** The item being dragged on this page, or null. Changes only when a drag starts or ends. */
export const useActiveDrag = () => useContext(ActiveCtx);

/** Pointer first (exact), then the overlay's box (keyboard drags have no pointer). */
const collide: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);
  return byPointer.length ? byPointer : rectIntersection(args);
};

/** Arrow keys jump between drop zones instead of nudging pixel by pixel. */
const jumpBetweenZones: KeyboardCoordinateGetter = (event, { context, currentCoordinates }) => {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  if (!keys.includes(event.code)) return undefined;
  event.preventDefault();
  const { active, droppableRects, droppableContainers, collisionRect, over } = context;
  if (!active || !collisionRect) return undefined;
  const zones = droppableContainers
    .getEnabled()
    .map((c) => ({ id: c.id, rect: droppableRects.get(c.id) }))
    .filter((z): z is { id: typeof z.id; rect: NonNullable<typeof z.rect> } => !!z.rect)
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
  if (!zones.length) return currentCoordinates;
  const at = zones.findIndex((z) => z.id === over?.id);
  const forward = event.code === 'ArrowRight' || event.code === 'ArrowDown';
  const next = zones[at < 0 ? (forward ? 0 : zones.length - 1) : (at + (forward ? 1 : zones.length - 1)) % zones.length];
  return {
    x: next.rect.left + next.rect.width / 2 - collisionRect.width / 2,
    y: next.rect.top + next.rect.height / 2 - collisionRect.height / 2,
  };
};

const label = (data: unknown) => (data as { label?: string } | undefined)?.label ?? 'item';

const announcements: Announcements = {
  onDragStart: ({ active }) => `Picked up ${label(active.data.current)}. Use the arrow keys to move between drop zones, Space to drop, Escape to cancel.`,
  onDragOver: ({ active, over }) => (over ? `${label(active.data.current)} is over ${label(over.data.current)}.` : `${label(active.data.current)} is not over a drop zone.`),
  onDragEnd: ({ active, over }) => (over ? `Dropped ${label(active.data.current)} on ${label(over.data.current)}.` : `${label(active.data.current)} was put back.`),
  onDragCancel: ({ active }) => `Cancelled. ${label(active.data.current)} was put back.`,
};

export function DragLayer({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DragItem | null>(null);
  const [flyBack, setFlyBack] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: jumpBetweenZones, keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] } }),
  );

  const onStart = useCallback((e: DragStartEvent) => {
    setFlyBack(true);
    setActive((e.active.data.current as DragItem) ?? null);
    document.body.classList.add('dnd-active');
  }, []);

  const finish = useCallback(() => {
    setActive(null);
    document.body.classList.remove('dnd-active');
  }, []);

  const onEnd = useCallback(
    (e: DragEndEvent) => {
      const item = e.active.data.current as DragItem | undefined;
      const zone = e.over?.data.current as ZoneData | undefined;
      const ok = !!item && !!zone && zone.accepts(item);
      // a good drop lands in the zone; anything else flies back to where it came from
      setFlyBack(!ok);
      finish();
      if (ok) zone!.onDrop(item!);
    },
    [finish],
  );

  const dropAnimation = useMemo(() => (flyBack ? { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' } : null), [flyBack]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collide}
      // zones slide in after a drag starts, so their boxes are re-measured while dragging (a handful of rects)
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onStart}
      onDragEnd={onEnd}
      onDragCancel={() => {
        setFlyBack(true);
        finish();
      }}
      accessibility={{ announcements, screenReaderInstructions: { draggable: 'To pick this up, press Space. While dragging, use the arrow keys to move between drop zones. Press Space again to drop, or Escape to cancel.' } }}
    >
      <ActiveCtx.Provider value={active}>{children}</ActiveCtx.Provider>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} zIndex={120} style={{ cursor: 'grabbing' }}>
          {active ? <div className="drag-lift">{active.preview}</div> : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}
