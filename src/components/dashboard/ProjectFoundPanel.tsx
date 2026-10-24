import { motion } from 'motion/react';
import { Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { PixelButton } from '../nav/PixelButton';
import { PROJECT_ICONS } from '../gravestone/icons';
import type { Project } from '../../data/projects';

interface ProjectFoundPanelProps {
  project: Project;
  onInspect: () => void;
}

/** The game-inventory style panel that appears when a stone is clicked (spec §3). */
export function ProjectFoundPanel({ project, onInspect }: ProjectFoundPanelProps) {
  const Icon = PROJECT_ICONS[project.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="notched hard-shadow"
      style={{
        width: 300,
        padding: 18,
        background: 'var(--color-deep-panel)',
        border: '4px double var(--color-lavender)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          color: 'var(--color-gold)',
          marginBottom: 12,
        }}
      >
        ✦ PROJECT FOUND! ✦
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div className="notched" style={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--color-lavender)' }}>
          <Icon size={22} color="var(--color-stone-engraving)" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{project.name}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{project.description}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
          <span>Progress</span>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mint)' }}>{project.progress}%</span>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        <Calendar size={14} /> Last visited: {project.lastVisited}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}>
        <Tag size={14} style={{ marginTop: 3, flexShrink: 0, color: 'var(--color-text-secondary)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="notched"
              style={{ fontSize: 12, padding: '3px 8px', border: '1px solid var(--color-lavender)', color: 'var(--color-text-secondary)' }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <PixelButton variant="gold" size="sm" onClick={onInspect} style={{ width: '100%', justifyContent: 'center' }}>
        INSPECT THIS IDEA <ArrowUpRight size={14} />
      </PixelButton>
    </motion.div>
  );
}
