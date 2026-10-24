import { useRef, useState } from 'react';
import { useProjects } from '../store/ProjectsContext';
import { PATHS, ASSET_META, STALL_REASON_META, INTEREST_LABELS } from '../domain/paths';
import { liveAnalysis, ago, STATUS_UI } from '../domain/insights';
import type { Project } from '../domain/types';
import { navigate } from '../lib/router';
import { Dialog } from './Dialog';
import { Button, ProgressBar } from './ui';
import { EditDialog } from './ProjectDialogs';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const monthLabel = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** Milestones worth showing: score and recommendation bookkeeping stays out of the headline timeline. */
function milestones(p: Project) {
  const skip = new Set(['score-recalculated', 'recommendation-generated', 'archive-note-added']);
  return [...p.timeline].filter((e) => !skip.has(e.type)).sort((a, b) => a.at.localeCompare(b.at)).slice(-6);
}

function Body({ project, onClose }: { project: Project; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const a = liveAnalysis(project);
  const ui = STATUS_UI[project.status];
  const rec = a.recommendation?.path;
  const events = milestones(project);
  const archived = project.status === 'archived';

  return (
    <>
      <div className="-mt-1 flex items-center gap-3">
        <span className="rl-status" style={{ background: ui.bg, color: ui.fg }}>
          {ui.chip}
        </span>
        <p className="text-sm font-semibold text-cream">
          {a.total == null ? 'Score not ready yet' : `Score ${a.total}${a.status === 'provisional' ? '*' : ''}`}
          {rec && <> · Suggested path: {PATHS[rec].label}</>}
        </p>
      </div>
      {a.status === 'provisional' && <p className="mt-1 text-xs text-dim">* Provisional. Add more details to complete the score.</p>}
      {project.description && <p className="mt-4 text-sm text-cream">{project.description}</p>}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="pixel-label text-[0.6rem] text-gold">Progress</dt>
          <dd className="mt-1">
            <ProgressBar value={project.progress} label={`${project.name} progress`} />
          </dd>
        </div>
        <div>
          <dt className="pixel-label text-[0.6rem] text-gold">Last worked</dt>
          <dd className="mt-1 text-sm font-bold">{ago(project)}</dd>
        </div>
        <div>
          <dt className="pixel-label text-[0.6rem] text-gold">Interest</dt>
          <dd className="mt-1 text-sm font-bold">{project.currentInterest ? INTEREST_LABELS[project.currentInterest].label : 'Not rated'}</dd>
        </div>
        <div>
          <dt className="pixel-label text-[0.6rem] text-gold">Why it stalled</dt>
          <dd className="mt-1 text-sm font-bold">{project.stallReason ? STALL_REASON_META[project.stallReason].label : 'Not recorded'}</dd>
        </div>
      </dl>
      {project.assets.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Reusable assets">
          {project.assets.map((x) => (
            <li key={x} className="chip">
              {ASSET_META[x].label}
            </li>
          ))}
        </ul>
      )}

      <h3 className="pixel-label mb-3 mt-6 text-[0.65rem] text-gold">Timeline</h3>
      <ol className="space-y-4 border-l-4 border-twilight pl-5" aria-label="Project timeline, oldest first">
        {events.map((e) => (
          <li key={e.id}>
            <p className="font-mono text-[11px] font-bold tracking-wider text-dim">{monthLabel(e.at)}</p>
            <p className="text-[15px] font-extrabold text-soft">{e.description}</p>
          </li>
        ))}
        <li>
          <p className="font-mono text-[11px] font-bold tracking-wider text-dim">NOW</p>
          <p className="text-[15px] font-extrabold text-sky">
            {archived ? 'Resting with care' : project.selectedPath ? `Path chosen: ${PATHS[project.selectedPath].label}` : 'Decision pending'}
          </p>
        </li>
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        {!archived && (
          <Button
            variant="gold"
            onClick={() => {
              onClose();
              navigate(`/decision?project=${project.id}`);
            }}
          >
            Open Decision Hub
          </Button>
        )}
        {archived && (
          <Button
            variant="mint"
            onClick={() => {
              onClose();
              navigate('/archive');
            }}
          >
            Go to Archive
          </Button>
        )}
        <Button variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
      <EditDialog project={project} open={editing} onClose={() => setEditing(false)} />
    </>
  );
}

export function ProjectDetailDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { get } = useProjects();
  const project = id ? get(id) : undefined;
  const last = useRef<Project | undefined>(undefined);
  if (project) last.current = project;
  const shown = project ?? last.current;
  return (
    <Dialog open={!!project} onClose={onClose} size="md" title={shown?.name ?? 'Project'}>
      {shown && <Body project={shown} onClose={onClose} />}
    </Dialog>
  );
}
