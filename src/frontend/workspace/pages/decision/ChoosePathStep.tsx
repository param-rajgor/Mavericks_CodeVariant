import { useState, useMemo, memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { PathId, Project, TaskItem } from '@/backend/domain/types';
import { PATH_LIST, PATHS } from '@/backend/domain/paths';
import { liveAnalysis } from '@/backend/domain/insights';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useSafe, useToast } from '@/frontend/ui/Toast';
import { DropZone } from '@/frontend/dnd/DropZone';
import { PATH_ICONS } from '@/frontend/dnd/icons';
import type { DragItem } from '@/frontend/dnd/DragLayer';
import { CheckSquare, Square, Calendar, History, Sparkles, ChevronDown, ChevronUp, GripVertical, Bell } from 'lucide-react';
import { PixelSprite, SPROUT } from '@/frontend/ui/PixelSprite';

const PATH_TASKS: Record<PathId, string[]> = {
  continue: [
    'Scope one atomic mini-milestone (ship in < 3 days)',
    'Purge dead dependencies and stale branch code',
    'Schedule a 2-hour uninterrupted sprint this weekend',
    'Write a 1-sentence public update for accountability',
  ],
  restart: [
    'Create a clean new repo with minimal boilerplate',
    'Cherry-pick only the top 2 reusable asset modules',
    'Strip feature scope down to a single core loop',
    'Commit a walking skeleton in under 24 hours',
  ],
  pivot: [
    'Draft a 3-bullet pitch for the new user value proposition',
    'Archive or delete modules that do not serve the new angle',
    'Re-brand project title to match fresh intent',
    'Validate new premise with at least 3 prospective users',
  ],
  repurpose: [
    'Extract standalone utility / UI components into a shared package',
    'Move design assets, diagrams, and data to your swipe file',
    'Document key technical learnings as a short retro note',
    'Archive codebase with peace of mind',
  ],
  archive: [
    'Tag release v0.0-archive and push final clean git commit',
    'Set revisit reminder date (3 to 6 months)',
    'Write a 2-sentence post-mortem in the project journal',
    'Celebrate what you learned while building it',
  ],
};

const isProjectCard = (item: DragItem) => item.kind === 'stone' || item.kind === 'card';

/** Draggable Keystone representing the project */
function DraggableProjectKeystone({ project }: { project: Project }) {
  const data: DragItem = useMemo(
    () => ({
      kind: 'card',
      label: project.name,
      projectId: project.id,
      archived: project.status === 'archived',
      preview: (
        <div className="p-4 bg-[#1e1c48] border-4 border-gold shadow-[0_8px_0_#14122e] text-center min-w-[200px]">
          <span className="font-display text-2xl text-gold block leading-tight">{project.name}</span>
          <span className="font-display text-sm tracking-wider text-cream uppercase mt-1 block">
            CROSSROADS KEYSTONE
          </span>
          <span className="text-[11px] text-mint mt-1 block">Drop on a Path Pedestal</span>
        </div>
      ),
    }),
    [project],
  );

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `keystone-${project.id}`,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable
      className={`relative p-5 bg-[#1b1944] border-4 border-gold shadow-[0_6px_0_#14122e] cursor-grab transition-all select-none ${
        isDragging ? 'ghost-slot opacity-40 scale-95' : 'hover:-translate-y-1'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <span className="font-display text-xs tracking-widest text-gold uppercase flex items-center gap-1.5">
          <GripVertical className="size-4 text-gold" />
          <span>DRAGGABLE KEYSTONE</span>
        </span>
        <span className="text-[11px] font-display text-mint bg-night px-2 py-0.5 border border-twilight">
          READY TO COMMIT
        </span>
      </div>

      <div className="py-4 text-center">
        <h3 className="font-display text-3xl font-bold text-soft leading-tight">{project.name}</h3>
        <p className="mt-1 text-xs text-cream/90 max-w-xs mx-auto">
          Drag this keystone onto any Path Pedestal below to commit your decision without buttons.
        </p>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 font-display text-xs text-gold">
        <span className="animate-pulse">⬇</span>
        <span>DRAG ONTO A PEDESTAL BELOW</span>
        <span className="animate-pulse">⬇</span>
      </div>
    </div>
  );
}

export function ChoosePathStep({ project }: { project: Project }) {
  const { actions } = useProjects();
  const safe = useSafe();
  const toast = useToast();
  const analysis = liveAnalysis(project);
  const rec = analysis.recommendation?.path ?? 'continue';
  const recMeta = PATHS[rec];

  const [showAllPaths, setShowAllPaths] = useState(false);
  const [reminderSelected, setReminderSelected] = useState<string>(project.revisitReminder ?? '');

  const chosenPath = project.selectedPath;

  // Handle drop onto pedestal
  const handleDropOnPath = async (path: PathId) => {
    const saved = await safe(() => actions.decide(project.id, path), 'Could not save that decision');
    if (saved) {
      toast.success(`${saved.name} → ${PATHS[path].label}`, undefined, {
        label: 'Undo',
        run: () => void actions.undo(),
      });

      // Populate default next-step tasks if empty
      if (!saved.tasks || saved.tasks.length === 0) {
        const defaultTasks: TaskItem[] = PATH_TASKS[path].map((text, i) => ({
          id: `task-${Date.now()}-${i}`,
          text,
          done: false,
        }));
        await actions.setTasks(project.id, defaultTasks);
      }
    }
  };

  const handleToggleTask = async (taskId: string) => {
    await actions.toggleTask(project.id, taskId);
  };

  const handleSetReminder = async (months: number, label: string) => {
    const target = new Date();
    target.setMonth(target.getMonth() + months);
    const dateStr = target.toISOString().split('T')[0];
    const fullReminder = `${label} (${dateStr})`;
    setReminderSelected(fullReminder);
    await actions.setReminder(project.id, fullReminder);
    toast.info('Reminder Scheduled', `We will prompt you to revisit ${project.name} on ${dateStr}.`);
  };

  const currentTasks = project.tasks && project.tasks.length > 0 ? project.tasks : null;

  // Decision timeline history
  const decisionEvents = useMemo(() => {
    return project.timeline
      .filter((e) => e.type === 'path-selected' || e.type === 'archived' || e.type === 'restarted')
      .reverse();
  }, [project.timeline]);

  return (
    <div className="space-y-8">
      {/* Draggable Keystone Section */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <Sparkles className="size-5" />
              <span className="font-display text-xl tracking-wider uppercase">THE CANVAS PROTOCOL ACTION SHRINE</span>
            </div>
            <h3 className="font-display text-3xl text-soft leading-tight">
              NO ACTION BUTTONS. DRAG THE KEYSTONE TO SEAL ITS FATE.
            </h3>
            <p className="mt-2 text-sm text-cream leading-relaxed">
              In accordance with the Canvas Protocol rules, primary decision actions are triggered exclusively by dragging your project keystone into a glowing Path Pedestal. Each pedestal commits the decision immediately with instant Undo support.
            </p>
            {chosenPath && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-display text-dim">CURRENT DECISION:</span>
                <span
                  className="px-3 py-1 font-display text-lg text-night"
                  style={{ background: PATHS[chosenPath].accent }}
                >
                  {PATHS[chosenPath].label.toUpperCase()} ✓
                </span>
              </div>
            )}
          </div>

          <DraggableProjectKeystone project={project} />
        </div>
      </div>

      {/* Recommended Path Grand Pedestal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 font-display text-lg bg-gold text-night font-bold uppercase">
              RECOMMENDED DESTINATION
            </span>
            <span className="text-xs text-dim">Based on facts, gut conviction, and market signals</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllPaths(!showAllPaths)}
            className="font-display text-lg text-gold hover:underline flex items-center gap-1"
          >
            <span>{showAllPaths ? 'Collapse other paths' : 'See all 5 path pedestals'}</span>
            {showAllPaths ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {/* Center Grand Pedestal for Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-start-2">
            <div className="path-pedestal">
              <DropZone
                id={`pedestal-${rec}`}
                label={recMeta.label.toUpperCase()}
                description={`Commit to ${recMeta.label}: ${recMeta.tagline}`}
                color={recMeta.accent}
                icon={PATH_ICONS[rec]}
                accepts={isProjectCard}
                onDrop={() => handleDropOnPath(rec)}
                idleHint="Drop Keystone here"
                width="100%"
                height={160}
                style={{
                  border: `4px solid ${recMeta.accent}`,
                  boxShadow: `0 0 24px ${recMeta.accent}44, 0 8px 0 #14122e`,
                }}
              >
                <span className="text-xs text-cream/80 px-2 mt-1 block font-display">
                  {recMeta.tagline}
                </span>
                {chosenPath === rec && (
                  <span className="text-xs font-bold text-mint mt-1 block">✓ CURRENTLY ACTIVE</span>
                )}
              </DropZone>
              <div
                className="w-full h-5 bg-[#12112e] border-t-4 border-l-4 border-r-4 shadow-[0_6px_0_#0d0c1f]"
                style={{ borderColor: recMeta.accent }}
              />
              <div className="w-[110%] h-3 bg-[#0d0c1f] border-t-2 border-white/20" />
            </div>
          </div>
        </div>

        {/* Collapsible Remaining 4 Path Pedestals */}
        {showAllPaths && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <span className="font-display text-xl text-soft block mb-4">ALL PATH SHRINES</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PATH_LIST.map((p) => {
                const isCurrent = chosenPath === p.id;
                return (
                  <div key={p.id} className="path-pedestal">
                    <DropZone
                      id={`pedestal-${p.id}`}
                      label={p.label.toUpperCase()}
                      description={`Commit to ${p.label}: ${p.tagline}`}
                      color={p.accent}
                      icon={PATH_ICONS[p.id]}
                      accepts={isProjectCard}
                      onDrop={() => handleDropOnPath(p.id)}
                      idleHint="Drop to commit"
                      width="100%"
                      height={140}
                      style={{
                        border: `3px solid ${isCurrent ? p.accent : '#57449a'}`,
                        boxShadow: isCurrent ? `0 0 16px ${p.accent}66, 0 6px 0 #14122e` : '0 6px 0 #14122e',
                      }}
                    >
                      <span className="text-[11px] text-cream/80 px-1 mt-0.5 block font-display">
                        {p.tagline}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-mint mt-1 block">✓ CHOSEN</span>
                      )}
                    </DropZone>
                    <div
                      className="w-full h-4 bg-[#12112e] border-t-2"
                      style={{ borderColor: p.accent }}
                    />
                    <div className="w-[108%] h-2.5 bg-[#0d0c1f]" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Feature 1: Next-Step Plan Checklist */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-mint" />
            <h4 className="font-display text-2xl text-soft leading-none">NEXT-STEP PLAN: CONCRETE TASKS</h4>
          </div>
          <span className="text-xs text-dim">Check off tasks as you execute</span>
        </div>

        {currentTasks ? (
          <div className="space-y-2.5">
            {currentTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => handleToggleTask(task.id)}
                className={`w-full p-3 flex items-center gap-3 border-2 transition-all text-left ${
                  task.done
                    ? 'bg-[#12142d] border-mint/40 text-dim line-through'
                    : 'bg-[#17163c] border-twilight text-cream hover:border-lavender'
                }`}
              >
                {task.done ? (
                  <CheckSquare className="size-5 text-mint shrink-0" />
                ) : (
                  <Square className="size-5 text-dim shrink-0" />
                )}
                <span className="text-sm font-semibold">{task.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-dim italic">
            Drag your Keystone onto a Path Pedestal above to automatically generate your concrete next-step task checklist!
          </p>
        )}
      </div>

      {/* Feature 2: Revisit Reminders */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-gold" />
            <div>
              <h4 className="font-display text-2xl text-soft leading-none">REVISIT REMINDER</h4>
              <p className="text-xs text-dim mt-0.5">Schedule a check-in so this project doesn't get permanently lost.</p>
            </div>
          </div>
          {reminderSelected && (
            <span className="px-3 py-1 bg-gold text-night font-display text-sm tracking-wider">
              ⏰ {reminderSelected}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleSetReminder(1, 'In 1 month')}
            className="px-3 py-2 bg-[#17163c] border-2 border-twilight hover:border-gold font-display text-sm text-cream"
          >
            In 1 Month
          </button>
          <button
            type="button"
            onClick={() => handleSetReminder(3, 'In 3 months')}
            className="px-3 py-2 bg-[#17163c] border-2 border-twilight hover:border-gold font-display text-sm text-cream"
          >
            In 3 Months
          </button>
          <button
            type="button"
            onClick={() => handleSetReminder(6, 'In 6 months')}
            className="px-3 py-2 bg-[#17163c] border-2 border-twilight hover:border-gold font-display text-sm text-cream"
          >
            In 6 Months
          </button>
          <button
            type="button"
            onClick={() => handleSetReminder(12, 'In 1 year')}
            className="px-3 py-2 bg-[#17163c] border-2 border-twilight hover:border-gold font-display text-sm text-cream"
          >
            In 1 Year
          </button>
        </div>
      </div>

      {/* Feature 3: Decision History Timeline */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
          <History className="size-5 text-sky" />
          <h4 className="font-display text-2xl text-soft leading-none">DECISION TIMELINE HISTORY</h4>
        </div>

        {decisionEvents.length > 0 ? (
          <ol className="space-y-3 border-l-2 border-twilight pl-4 text-sm">
            {decisionEvents.map((evt) => (
              <li key={evt.id} className="relative">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-gold" />
                <span className="text-xs text-dim block">
                  {new Date(evt.at).toLocaleDateString()} · {new Date(evt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-semibold text-soft block mt-0.5">{evt.description}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-dim italic">No decisions recorded yet. Drag the Keystone above to begin.</p>
        )}
      </div>
    </div>
  );
}
