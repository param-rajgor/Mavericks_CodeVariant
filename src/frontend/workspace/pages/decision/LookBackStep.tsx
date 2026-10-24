import type { Project } from '@/backend/domain/types';
import { ASSET_META, STALL_REASON_META, INTEREST_LABELS } from '@/backend/domain/paths';
import { STATUS_UI, ago } from '@/backend/domain/insights';
import { PROJECT_ICONS } from '@/frontend/graveyard/gravestone/icons';
import { toStone } from '@/frontend/graveyard/stone';
import { Check, Clock, AlertTriangle, Layers, Calendar } from 'lucide-react';

export function LookBackStep({ project }: { project: Project }) {
  const stone = toStone(project);
  const Icon = PROJECT_ICONS[stone.icon];
  const ui = STATUS_UI[project.status];
  const reasons = project.reasons?.length
    ? project.reasons.map((r) => STALL_REASON_META[r]?.label ?? r).join(', ')
    : project.stallReason
      ? STALL_REASON_META[project.stallReason]?.label
      : 'None recorded';

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <span className="notched grid size-16 shrink-0 place-items-center bg-stone">
              <Icon size={32} color="#4a3e80" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-3xl font-bold text-soft leading-none">{project.name}</h3>
                <span className="rl-status text-xs" style={{ background: ui.bg, color: ui.fg }}>
                  {ui.chip}
                </span>
              </div>
              <p className="mt-1 text-base text-cream">{project.description || 'No description provided.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="font-display text-sm tracking-wider text-dim block">DOMAIN</span>
              <span className="font-display text-2xl text-gold">{project.domain}</span>
            </div>
            <div className="text-right">
              <span className="font-display text-sm tracking-wider text-dim block">PROGRESS</span>
              <span className="font-display text-2xl text-mint">{project.progress}%</span>
            </div>
          </div>
        </div>

        {/* Fact Grids */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* What's Done */}
          <div className="bg-[#151438] p-4 border-2 border-lavender/30">
            <div className="flex items-center gap-2 font-display text-xl text-mint mb-3">
              <Check className="size-5" />
              <span>WHAT'S DONE</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-dim">
                <span>Progress:</span>
                <span className="font-bold text-soft">{project.progress}% completed</span>
              </div>
              <div className="h-2.5 w-full bg-night border border-twilight">
                <div className="h-full bg-mint" style={{ width: `${project.progress}%` }} />
              </div>
              {project.completedItems.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-cream">
                  {project.completedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-mint">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-dim italic mt-2">No completed checklist items logged.</p>
              )}
            </div>
          </div>

          {/* Why It Stopped */}
          <div className="bg-[#151438] p-4 border-2 border-coral/30">
            <div className="flex items-center gap-2 font-display text-xl text-coral mb-3">
              <AlertTriangle className="size-5" />
              <span>WHY IT STOPPED</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-cream">
                <span className="text-dim block text-xs">Primary Reasons:</span>
                <span className="font-bold text-coral text-base">{reasons}</span>
              </div>
              {project.stallReasonDetails && (
                <p className="text-xs text-cream/90 bg-night/50 p-2 border border-white/5">
                  “{project.stallReasonDetails}”
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-dim pt-2">
                <Clock className="size-3.5" />
                <span>Last worked: {ago(project)}</span>
              </div>
            </div>
          </div>

          {/* What's Reusable */}
          <div className="bg-[#151438] p-4 border-2 border-sky/30">
            <div className="flex items-center gap-2 font-display text-xl text-sky mb-3">
              <Layers className="size-5" />
              <span>WHAT'S REUSABLE</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {project.assets.length > 0 ? (
                  project.assets.map((asset) => (
                    <span
                      key={asset}
                      className="px-2 py-0.5 bg-sky/20 border border-sky/40 font-display text-sm text-sky tracking-wide"
                    >
                      {ASSET_META[asset]?.label ?? asset}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-dim italic">No assets tagged yet</span>
                )}
              </div>
              {project.assetNotes && (
                <p className="text-xs text-cream/90 mt-2 bg-night/50 p-2 border border-white/5">
                  {project.assetNotes}
                </p>
              )}
              <div className="pt-2 text-xs text-dim flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Started: {new Date(project.startedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current gut feeling check */}
        <div className="mt-6 bg-[#1a1740] p-4 border-l-4 border-gold flex items-center justify-between">
          <div>
            <span className="font-display text-lg text-gold tracking-wide">SELF-REPORTED INTEREST</span>
            <p className="text-sm text-cream">
              {project.currentInterest
                ? `${INTEREST_LABELS[project.currentInterest]?.label}: ${project.interestNote || 'No additional note'}`
                : 'No interest rating set yet.'}
            </p>
          </div>
          <span className="num font-display text-3xl text-gold">
            {project.currentInterest ? `${project.currentInterest}/5` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
