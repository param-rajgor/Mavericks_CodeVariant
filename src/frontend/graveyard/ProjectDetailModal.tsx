import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, HelpCircle, Recycle, Tag, X } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { liveAnalysis } from '@/backend/domain/insights';
import { PATHS } from '@/backend/domain/paths';
import { navigate } from '@/frontend/routing/router';
import { PixelButton } from '@/frontend/ui/PixelButton';
import { EditDialog } from '@/frontend/workspace/components/ProjectDialogs';
import { StatusPill } from './gravestone/StatusPill';
import { PROJECT_ICONS } from './gravestone/icons';
import { toStone, type Stone } from './stone';

function Block({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, color: 'var(--color-gold)', marginBottom: 4 }}>
        {icon} {label.toUpperCase()}
      </div>
      <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0 }}>{text}</p>
    </div>
  );
}

interface Shown {
  stone: Stone;
  score: number | null;
  path: string | null;
}

/**
 * "Why it stalled" and "What can be reused", opened from a stone or from any list.
 * It is the single place a project is inspected, from every page.
 */
export function ProjectDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { get } = useProjects();
  const project = id ? get(id) : undefined;
  const last = useRef<Shown | null>(null);
  const [editing, setEditing] = useState(false);
  if (project) {
    const a = liveAnalysis(project);
    last.current = { stone: toStone(project), score: a.total, path: a.recommendation ? PATHS[a.recommendation.path].label : null };
  }
  const shown = last.current;

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editing) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose, editing]);

  const Icon = shown ? PROJECT_ICONS[shown.stone.icon] : null;
  return createPortal(
    <AnimatePresence>
      {project && shown && Icon && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-panel)', background: 'rgba(14,13,34,0.7)', display: 'grid', placeItems: 'center', padding: 24 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${shown.stone.name} details`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="rl-panel rl-panel-hi"
            style={{ width: 560, maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', padding: 28, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="notched" style={{ width: 52, height: 52, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--color-lavender)' }}>
                  <Icon size={26} color="var(--color-stone-engraving)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 0.95, letterSpacing: 1 }}>{shown.stone.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <StatusPill status={shown.stone.status} />
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', flexShrink: 0, minHeight: 44, minWidth: 44 }}>
                <X size={22} />
              </button>
            </div>

            <p style={{ fontSize: 19, color: 'var(--color-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{shown.stone.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
              <Calendar size={16} /> Last visited: {shown.stone.lastVisited} · {shown.stone.progress}% done
              {shown.score != null && <> · Score {shown.score}</>}
            </div>
            {shown.stone.stack.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 18 }}>
                <Tag size={16} style={{ marginTop: 4, flexShrink: 0, color: 'var(--color-text-secondary)' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {shown.stone.stack.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Block icon={<HelpCircle size={18} />} label="Why it stalled" text={shown.stone.whyStalled || "Still in progress, so it hasn't stalled."} />
            <Block icon={<Recycle size={18} />} label="What can be reused" text={shown.stone.reusable} />
            {shown.path && <Block icon={<span aria-hidden="true">✦</span>} label="Suggested path" text={`${shown.path}. A suggestion to think with, not a verdict.`} />}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              {project.status !== 'archived' ? (
                <PixelButton
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate(`/decision?project=${project.id}`);
                  }}
                >
                  OPEN DECISION SHRINE
                </PixelButton>
              ) : (
                <PixelButton
                  variant="mint"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate('/archive');
                  }}
                >
                  GO TO ARCHIVE
                </PixelButton>
              )}
              <PixelButton variant="dark-outline" size="sm" onClick={() => setEditing(true)}>
                EDIT
              </PixelButton>
            </div>
            <EditDialog project={project} open={editing} onClose={() => setEditing(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
