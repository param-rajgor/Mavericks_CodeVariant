import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, HelpCircle, Recycle } from 'lucide-react';
import { PROJECT_ICONS } from '../gravestone/icons';
import { StatusPill } from '../gravestone/StatusPill';
import type { Project } from '../../data/projects';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

/** "Why it stalled" / "What can be reused" drawer opened from the panel's Inspect
 * button (spec §3). No reference frame exists for this one — styled to match the
 * rest of the system (dark panel, lavender double border, notched corners). */
export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  const Icon = project ? PROJECT_ICONS[project.icon] : null;

  return (
    <AnimatePresence>
      {project && Icon && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(14,13,34,0.65)',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
          }}
        >
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} details`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="notched hard-shadow"
            style={{
              width: 420,
              maxWidth: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--color-deep-panel)',
              border: '4px double var(--color-lavender)',
              padding: 24,
              fontFamily: 'var(--font-ui)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="notched" style={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--color-lavender)' }}>
                  <Icon size={22} color="var(--color-stone-engraving)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>{project.name}</div>
                  <div style={{ marginTop: 4 }}>
                    <StatusPill status={project.status} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>{project.description}</p>

            <DetailBlock icon={<HelpCircle size={16} />} label="Why it stalled" text={project.whyStalled || "Still in progress — hasn't stalled."} />
            <DetailBlock icon={<Recycle size={16} />} label="What can be reused" text={project.reusable} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailBlock({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          color: 'var(--color-gold)',
          marginBottom: 6,
        }}
      >
        {icon} {label.toUpperCase()}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0 }}>{text}</p>
    </div>
  );
}
