import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Project } from '../domain/types';
import { analyzeProject, projectToInput } from '../domain/analysis';
import { formatDate, timeAgo } from '../domain/dates';
import { PATHS, STALL_REASON_META } from '../domain/paths';
import { Link } from '../lib/router';
import { PathBadge, ProgressBar, SampleChip, StatusBadge, TagList } from './ui';

export function ScorePill({ project, now }: { project: Project; now?: Date }) {
  const a = analyzeProject(projectToInput(project), now);
  if (a.total == null) return <span className="chip font-mono !bg-cream !text-[#6B4A00]" title="Add more details to see a score">Score: needs info</span>;
  return (
    <span className="chip font-mono" title={a.status === 'provisional' ? 'Provisional score: some details are missing' : 'Relaunch Score'}>
      Score {a.total}
      {a.status === 'provisional' && <span aria-label="provisional">~</span>}
    </span>
  );
}

export function recommendedFor(project: Project) {
  const a = analyzeProject(projectToInput(project));
  return { analysis: a, path: project.selectedPath ?? a.recommendation?.path ?? null, chosen: !!project.selectedPath };
}

export function ProjectCard({ project, layout = 'list' }: { project: Project; layout?: 'list' | 'cards' }) {
  const [open, setOpen] = useState(false);
  const { analysis, path, chosen } = recommendedFor(project);
  const detailId = `peek-${project.id}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="rl-panel relative flex flex-col gap-3 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold leading-tight">
              <Link to={`/projects/${project.id}`} className="after:absolute after:inset-0 after:content-[''] hover:underline">
                {project.name}
              </Link>
            </h3>
            <StatusBadge status={project.status} />
            {project.isDemo && <SampleChip />}
          </div>
          <p className={`text-sm text-muted ${layout === 'cards' ? 'line-clamp-3' : 'line-clamp-2'}`}>{project.description}</p>
        </div>
        <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-twilight" />
      </div>

      <TagList tags={[project.domain, ...project.tags]} />
      <ProgressBar value={project.progress} label={`${project.name} completion`} />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span title={formatDate(project.lastWorkedAt)}>Last worked {timeAgo(project.lastWorkedAt)}</span>
        <span aria-hidden>·</span>
        <ScorePill project={project} />
        {path && <PathBadge path={path} prefix={chosen ? 'Chosen: ' : 'Suggested: '} />}
      </div>

      <div className="relative z-10 -mb-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-extrabold text-twilight hover:underline"
        >
          Quick look <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={detailId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <dl className="space-y-2 border-t-2 border-line pt-3 text-sm">
                <div>
                  <dt className="font-extrabold">Why it stopped</dt>
                  <dd className="text-muted">{project.stallReason ? STALL_REASON_META[project.stallReason].label : 'Not recorded'}</dd>
                </div>
                {project.remainingItems.length > 0 && (
                  <div>
                    <dt className="font-extrabold">Next up</dt>
                    <dd className="text-muted">{project.remainingItems.slice(0, 2).join(' · ')}</dd>
                  </div>
                )}
                {path && analysis.recommendation && (
                  <div>
                    <dt className="font-extrabold">{PATHS[path].label}</dt>
                    <dd className="text-muted">{chosen ? PATHS[path].tagline : analysis.recommendation.reasons[0]}</dd>
                  </div>
                )}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
