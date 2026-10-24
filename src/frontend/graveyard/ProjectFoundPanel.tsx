import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { Calendar, Tag, AlertTriangle, GripVertical, X } from 'lucide-react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { UnpinZone } from '@/frontend/dnd/UnpinZone';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';
import type { Stone as Project } from '@/frontend/graveyard/stone';
import type { StallReason } from '@/backend/domain/types';
import { STALL_REASON_META } from '@/backend/domain/paths';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useToast } from '@/frontend/ui/Toast';
import type { DragItem } from '@/frontend/dnd/DragLayer';

interface ProjectFoundPanelProps {
  project: Project;
  onInspect: () => void;
}

const overlaps = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Where the panel sits in the page layout: an empty slot that keeps the panel's place, while the panel itself
 * is portalled to <body> above every scene layer, stone and bar. If it still has to cover its own stone
 * (a short window), the scene behind it dims a little.
 */
export function ProjectFoundSlot({ project, onInspect, onClose }: { project: Project | null; onInspect: () => void; onClose: () => void }) {
  const slot = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  return (
    <>
      {project && (
        <div className="found-panel" style={{ position: 'absolute', top: 0, right: 0 }}>
          <div ref={slot} style={{ width: 410, height }} />
        </div>
      )}
      {createPortal(
        <AnimatePresence>{project && <FloatingPanel key="found" project={project} onInspect={onInspect} onClose={onClose} slot={slot} onHeight={setHeight} />}</AnimatePresence>,
        document.body,
      )}
    </>
  );
}

/** A press that moves further than this is a drag, not a click, and never closes the panel. */
const DRAG_PX = 6;

/** True while a modal (the detail view, a dialog) is open: it owns clicks and Escape, not the panel behind it. */
const modalOpen = () => !!document.querySelector('[aria-modal="true"]');

/**
 * Closes the panel on a real click or tap outside it, or on Escape. Clicks on stones are left to the stones
 * (same stone toggles it off, another stone switches it), and presses that turn into a drag are ignored.
 */
function useDismiss(panel: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    let cleanupPress = () => {};
    const onPointerDown = (e: PointerEvent) => {
      cleanupPress();
      if (!e.isPrimary || e.button !== 0) return;
      const target = e.target as Element;
      if (panel.current?.contains(target) || target.closest?.('[data-stone]') || modalOpen()) return;
      const { clientX: x0, clientY: y0 } = e;
      let dragged = false;
      const onMove = (m: PointerEvent) => {
        if (Math.hypot(m.clientX - x0, m.clientY - y0) > DRAG_PX) dragged = true;
      };
      const onDrag = () => (dragged = true);
      const onUp = () => {
        cleanupPress();
        if (!dragged) onClose();
      };
      cleanupPress = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('dragstart', onDrag);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', cleanupPress);
        cleanupPress = () => {};
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('dragstart', onDrag);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', cleanupPress);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !modalOpen()) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      cleanupPress();
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [panel, onClose]);
}

export function DraggableReasonChip({ projectId, reason }: { projectId: string; reason: StallReason }) {
  const label = STALL_REASON_META[reason]?.label ?? reason;
  const data: DragItem = useMemo(
    () => ({
      kind: 'reason-chip',
      label,
      reason,
      projectId,
      preview: (
        <span className="notched inline-flex items-center gap-1.5 px-3 py-1 bg-[#251f4d] border-2 border-coral shadow-[0_4px_0_#14122e] text-soft font-display text-sm uppercase">
          <span>{label}</span>
        </span>
      ),
    }),
    [label, reason, projectId],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `chip-${projectId}-${reason}`,
    data,
  });

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      className={`notched inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-[#2b255c] border border-lavender select-none cursor-grab transition-all ${
        isDragging ? 'opacity-30 border-dashed scale-95' : 'hover:border-coral'
      }`}
    >
      <GripVertical className="size-3 text-dim shrink-0" />
      <span className="font-display uppercase tracking-wide text-soft text-xs">{label}</span>
    </span>
  );
}

function FloatingPanel({ project, onInspect, onClose, slot, onHeight }: ProjectFoundPanelProps & { onClose: () => void; slot: RefObject<HTMLDivElement | null>; onHeight: (h: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState(false);
  const isPresent = useIsPresent();
  const close = useCallback(() => isPresent && onClose(), [isPresent, onClose]);
  useDismiss(box, close);

  // Follow the slot every frame while open (page scroll, resizes, the stones settling in).
  useLayoutEffect(() => {
    let raf = 0;
    let last = '';
    const place = () => {
      const s = slot.current?.getBoundingClientRect();
      const el = box.current;
      if (s && el) {
        const p = el.getBoundingClientRect();
        const key = `${s.left.toFixed(1)},${s.top.toFixed(1)},${p.height.toFixed(0)}`;
        if (key !== last) {
          last = key;
          el.style.left = `${s.left}px`;
          el.style.top = `${s.top}px`;
          onHeight(p.height);
        }
        const stone = document.querySelector(`[data-stone="${CSS.escape(project.id)}"]`)?.getBoundingClientRect();
        setDim(!!stone && overlaps(p, stone));
        // closing shrinks the panel back toward its stone
        if (stone) el.style.transformOrigin = `${stone.left + stone.width / 2 - p.left}px ${stone.top + stone.height / 2 - p.top}px`;
      }
      raf = requestAnimationFrame(place);
    };
    place();
    return () => cancelAnimationFrame(raf);
  }, [slot, project.id, onHeight]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: dim ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-panel)', background: 'rgba(14,13,34,0.35)', pointerEvents: 'none' }}
      />
      <motion.div ref={box} exit={{ opacity: 0, scale: 0.15, transition: { duration: 0.2, ease: 'easeIn' } }} style={{ position: 'fixed', top: -9999, left: 0, zIndex: 'var(--z-panel)' }}>
        <ProjectFoundPanel project={project} onInspect={onInspect} />
      </motion.div>
    </>
  );
}

/** The game-inventory style panel that appears when a stone is clicked (spec §3). */
export function ProjectFoundPanel({ project, onInspect }: ProjectFoundPanelProps) {
  const Icon = PROJECT_ICONS[project.icon];
  const { actions } = useProjects();
  const toast = useToast();
  const dropData = useMemo(
    () => ({
      label: project.name,
      accepts: (i: DragItem) => i.kind === 'reason',
      onDrop: async (i: DragItem) => {
        if (i.reason) {
          await actions.addReason(project.id, i.reason);
          toast.success(`Tagged "${project.name}"`, `Added reason: ${STALL_REASON_META[i.reason]?.label}`);
        }
      },
    }),
    [project.id, project.name, actions, toast],
  );
  const { setNodeRef: setPanelDropRef, isOver } = useDroppable({
    id: `found-panel-drop-${project.id}`,
    data: dropData,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="notched hard-shadow"
      style={{
        width: 410,
        padding: 22,
        background: 'var(--color-deep-panel)',
        border: '4px double var(--color-lavender)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          lineHeight: 1,
          letterSpacing: 2,
          color: 'var(--color-gold)',
          textShadow: '0 3px 0 #14122E',
          marginBottom: 16,
        }}
      >
        ✦ PROJECT FOUND! ✦
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="notched" style={{ width: 52, height: 52, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--color-lavender)' }}>
          <Icon size={26} color="var(--color-stone-engraving)" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, lineHeight: 0.9, letterSpacing: 1 }}>{project.name}</div>
          <div style={{ fontSize: 18, lineHeight: 1.45, marginTop: 6, color: 'var(--color-text-secondary)' }}>{project.description}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
          <span>PROGRESS</span>
          <span className="num" style={{ fontSize: 34, lineHeight: 1, color: 'var(--color-mint)', textShadow: '0 3px 0 #14122E' }}>{project.progress}%</span>
        </div>
        <div style={{ height: 12, background: 'var(--color-night-indigo)', border: '2px solid var(--color-stone-outline)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'var(--color-mint)',
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(36,35,79,0.3) 0 3px, transparent 3px 7px)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        <Calendar size={18} /> Last visited: <strong style={{ color: 'var(--color-text-primary)' }}>{project.lastVisited}</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 18 }}>
        <Tag size={16} style={{ marginTop: 5, flexShrink: 0, color: 'var(--color-text-secondary)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="notched"
              style={{ fontSize: 17, padding: '4px 10px', border: '2px solid var(--color-lavender)', color: 'var(--color-text-primary)' }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Pinned Stall Reasons as draggable chips (Phase 4) */}
      <div
        ref={setPanelDropRef}
        style={{
          marginBottom: 16,
          padding: 8,
          background: isOver ? 'rgba(255,209,102,0.1)' : 'rgba(20,18,46,0.3)',
          border: isOver ? '2px dashed var(--color-gold)' : '1px solid rgba(255,255,255,0.08)',
          transition: 'all 150ms ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--color-coral)', marginBottom: 6 }}>
          <AlertTriangle size={14} /> STALL REASONS (DRAG ONE OUT TO REMOVE IT)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.reasons.length > 0 ? (
            project.reasons.map((r) => (
              <DraggableReasonChip key={r} projectId={project.id} reason={r} />
            ))
          ) : (
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Drag a reason from the left rack to tag why this idea stalled.
            </span>
          )}
        </div>
        <UnpinZone projectId={project.id} />
      </div>

      {project.lastDecision && (
        <div style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Last decision: <strong style={{ color: 'var(--color-gold)' }}>{project.lastDecision}</strong>
        </div>
      )}
      <p style={{ margin: 0, padding: '10px 12px', border: '2px dashed var(--color-lavender)', fontSize: 17, lineHeight: 1.4, color: 'var(--color-text-primary)' }}>
        Drag this stone onto <strong style={{ color: 'var(--color-gold)' }}>LOOK CLOSER</strong> for the full story, or onto a path to decide its fate.
      </p>
    </motion.div>
  );
}
