import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { navigate, useRoute } from '@/frontend/routing/router';
import { PageHeader } from '@/frontend/ui/primitives';
import { EmptyGraveyard } from '@/frontend/workspace/components/States';
import { useChrome } from '@/frontend/shell/AppChrome';
import { DragLayer } from '@/frontend/dnd/DragLayer';
import { LookBackStep } from './decision/LookBackStep';
import { LookAroundStep } from './decision/LookAroundStep';
import { LookInsideStep } from './decision/LookInsideStep';
import { YourScoreStep } from './decision/YourScoreStep';
import { ChoosePathStep } from './decision/ChoosePathStep';
import { liveAnalysis } from '@/backend/domain/insights';

type StepNumber = 1 | 2 | 3 | 4 | 5;

const STEPS: { num: StepNumber; label: string; title: string }[] = [
  { num: 1, label: 'Look Back', title: 'The Facts' },
  { num: 2, label: 'Look Around', title: 'GitHub Signals' },
  { num: 3, label: 'Look Inside', title: 'Questionnaire' },
  { num: 4, label: 'Your Score', title: '3-Part Score' },
  { num: 5, label: 'Choose Path', title: 'Action Shrines' },
];

export function DecisionHubPage() {
  const route = useRoute();
  const { projects } = useProjects();
  const { openNew } = useChrome();
  const openProjects = useMemo(() => projects.filter((p) => p.status !== 'archived'), [projects]);
  const wanted = route.name === 'decision' ? route.id : undefined;

  // Fallback to highest-priority project
  const fallback = useMemo(() => {
    const undecided = openProjects.filter((p) => !p.selectedPath);
    const pool = undecided.length ? undecided : openProjects;
    return [...pool].sort((a, b) => (liveAnalysis(b).total ?? -1) - (liveAnalysis(a).total ?? -1))[0]?.id;
  }, [openProjects]);

  const [picked, setPicked] = useState<string | undefined>(wanted);
  useEffect(() => setPicked(wanted), [wanted]);
  const project = projects.find((p) => p.id === (picked ?? fallback));

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Decision Shrine" subtitle="Every idea reaches a crossroads. Pick the path that fits." />
        <EmptyGraveyard onNew={openNew} filtered={projects.length > 0} />
      </div>
    );
  }

  return (
    <DragLayer>
      <div className="mx-auto max-w-[88rem] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader
            title="Decision Shrine"
            subtitle="A guided five-step crossroads journey. Drag your keystone to seal its fate."
          />

          {/* Project Switcher */}
          <div className="relative min-w-[240px]">
            <span className="sr-only">Choose a project</span>
            <select
              value={project.id}
              onChange={(e) => {
                setPicked(e.target.value);
                navigate(`/decision?project=${e.target.value}`, { replace: true });
              }}
              className="h-12 w-full appearance-none border-[3px] border-lavender bg-[#f3eaff] pl-4 pr-10 text-base font-extrabold text-night font-display"
            >
              {openProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.selectedPath ? '✓' : ''}
                </option>
              ))}
              {project.status === 'archived' && (
                <option value={project.id}>{project.name} (archived)</option>
              )}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-twilight"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="rl-panel p-4 border-[3px] border-twilight shadow-[0_5px_0_#14122e]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STEPS.map((s) => {
              const active = currentStep === s.num;
              const completed = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`p-3 text-left transition-all border-2 flex flex-col justify-between ${
                    active
                      ? 'bg-[#25225c] border-gold shadow-[0_3px_0_#9a7000]'
                      : completed
                        ? 'bg-[#151438] border-mint/50 opacity-90'
                        : 'bg-[#151438] border-twilight/50 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs tracking-wider text-dim">
                      STEP {s.num}
                    </span>
                    {completed ? (
                      <span className="text-mint font-bold text-xs">✓</span>
                    ) : active ? (
                      <span className="text-gold text-xs animate-pulse">●</span>
                    ) : null}
                  </div>
                  <div>
                    <span
                      className="font-display text-lg tracking-wide block leading-tight mt-1"
                      style={{ color: active ? '#ffd166' : completed ? '#a8e6a1' : '#f8f3ff' }}
                    >
                      {s.label}
                    </span>
                    <span className="text-[11px] text-dim block">{s.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Content */}
        <div className="min-h-[420px]">
          {currentStep === 1 && <LookBackStep project={project} />}
          {currentStep === 2 && <LookAroundStep project={project} />}
          {currentStep === 3 && <LookInsideStep project={project} />}
          {currentStep === 4 && <YourScoreStep project={project} />}
          {currentStep === 5 && <ChoosePathStep project={project} />}
        </div>

        {/* Guided Navigation Footer: Back / Next / Skip */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as StepNumber)}
            className="px-4 py-2 bg-[#17163c] border-2 border-twilight font-display text-base text-cream hover:border-lavender disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            <span>BACK</span>
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="text-xs text-dim hover:text-gold font-display uppercase tracking-wider underline mr-2"
              >
                Skip to Choose Path
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as StepNumber)}
                className="px-6 py-2.5 bg-gold text-night border-2 border-[#14122e] font-display text-lg font-bold shadow-[0_3px_0_#9a7000] flex items-center gap-2"
              >
                <span>NEXT: {STEPS[currentStep].label.toUpperCase()}</span>
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <span className="text-xs text-mint font-display tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-4 text-gold" />
                <span>FINAL STEP · DRAG KEYSTONE ONTO A PEDESTAL ABOVE</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </DragLayer>
  );
}
