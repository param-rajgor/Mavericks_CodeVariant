import { useState } from 'react';
import type { Project } from '@/backend/domain/types';
import { Heart, Compass, Zap, HelpCircle } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useToast } from '@/frontend/ui/Toast';
import { DropZone } from '@/frontend/dnd/DropZone';
import { DragCard, CardPreview } from '@/frontend/dnd/DragCard';
import type { DragItem } from '@/frontend/dnd/DragLayer';

interface Question {
  id: string;
  title: string;
  subtitle: string;
  lowLabel: string;
  highLabel: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'conviction',
    title: '1. Genuine Excitement',
    subtitle: 'When you imagine working on this this weekend, do you feel dread or genuine creative excitement?',
    lowLabel: 'Dread / Chore',
    highLabel: 'Electric Excitement',
  },
  {
    id: 'clarity',
    title: '2. Clarity of Next Step',
    subtitle: 'Do you know the exact next 3 features or lines of code to write, or is the architecture a fog?',
    lowLabel: 'Total Fog',
    highLabel: 'Crystal Clear',
  },
  {
    id: 'bandwidth',
    title: '3. Time & Bandwidth',
    subtitle: 'Can you realistically commit 3 to 5 focused hours per week without burning out your schedule?',
    lowLabel: 'No Chance',
    highLabel: 'Calendar Cleared',
  },
  {
    id: 'friction',
    title: '4. Tech Stack Friction',
    subtitle: 'Is the tech stack fighting you (compiler hell, bad libraries), or is building pleasant?',
    lowLabel: 'Fighting Tech',
    highLabel: 'Smooth Flow',
  },
  {
    id: 'demand',
    title: '5. Real-World Pull',
    subtitle: 'Has a friend, colleague, or prospective user asked for this, or are you creating in a vacuum?',
    lowLabel: 'Just Me Alone',
    highLabel: 'People Want It',
  },
  {
    id: 'attachment',
    title: '6. Sunk Cost vs. Future Value',
    subtitle: 'Are you reluctant to drop this just because you spent weeks on it, or does it hold real future value?',
    lowLabel: 'Pure Sunk Cost',
    highLabel: 'Real Future Value',
  },
];

export function LookInsideStep({ project }: { project: Project }) {
  const { actions } = useProjects();
  const toast = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const saved = project.questionnaireAnswers;
    const initial: Record<string, number> = {};
    QUESTIONS.forEach((q) => {
      initial[q.id] = typeof saved?.[q.id] === 'number' ? (saved[q.id] as number) : 3;
    });
    return initial;
  });

  // Choosing a number only sets the dial. The answers are kept when the gut-check seal is dropped on its zone.
  const handleSelect = (questionId: string, rating: number) => {
    setAnswers((a) => ({ ...a, [questionId]: rating }));
    setSealed(false);
  };
  const [sealed, setSealed] = useState(() => !!project.questionnaireAnswers);
  const seal = async () => {
    await actions.saveQuestionnaire(project.id, answers);
    setSealed(true);
    toast.success('Gut check sealed', 'Your answers now count in the score.', { label: 'Undo', run: () => void actions.undo() });
  };

  // Compute conviction score (out of 30, normalized to 100)
  const totalPoints = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const percent = Math.round((totalPoints / (QUESTIONS.length * 5)) * 100);

  const moodVerdict =
    percent >= 75
      ? { title: 'High Conviction & Strong Pull', color: '#a8e6a1', note: 'Your gut and circumstances align with continuing or restarting with fresh vigor.' }
      : percent >= 50
        ? { title: 'Mixed Conviction', color: '#ffd166', note: 'You care about the premise, but scope or bandwidth is holding you back. Narrowing scope is essential.' }
        : { title: 'Heavy Resistance & Sunk Cost', color: '#ff9db5', note: 'Your gut is telling you to let go. Repurposing assets or archiving will liberate your focus.' };

  return (
    <div className="space-y-6">
      {/* Questionnaire Summary Header */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Heart className="size-6 text-coral" />
            <div>
              <h3 className="font-display text-2xl text-soft leading-none">LOOK INSIDE: THE GUT CHECK</h3>
              <p className="text-sm text-dim mt-1">
                Answer these 6 questions honestly. Your feelings feed directly into the "You" factor of the score.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-display text-dim">INTERNAL CONVICTION:</span>
            <span className="font-display text-2xl text-gold">{percent}%</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-[#151438] border-l-4" style={{ borderColor: moodVerdict.color }}>
          <div className="flex items-center gap-2">
            <Zap className="size-4" style={{ color: moodVerdict.color }} />
            <span className="font-display text-lg tracking-wide text-soft">{moodVerdict.title}</span>
          </div>
          <p className="mt-1 text-sm text-cream">{moodVerdict.note}</p>
        </div>
      </div>

      {/* The seal: drag it onto the zone to keep the answers */}
      <div className="rl-panel flex flex-wrap items-center gap-6 p-5 border-2 border-twilight">
        <DragCard
          id="gut-seal"
          item={{ kind: 'token', label: 'Gut-check seal', payload: 'seal', preview: <CardPreview title="GUT-CHECK SEAL" hint="Drop on SEAL YOUR ANSWERS" color="#FF9DB5" /> }}
          className="p-4 bg-[#1b1944] border-4 border-coral shadow-[0_6px_0_#14122e] select-none"
        >
          <span className="font-display text-2xl text-coral block leading-none">GUT-CHECK SEAL</span>
          <span className="text-sm text-cream block mt-1">Set the 6 dials, then drag me →</span>
        </DragCard>
        <DropZone id="seal-zone" label="SEAL YOUR ANSWERS" description="Keep your gut-check answers" color="#FF9DB5" idleHint={sealed ? 'Sealed ✓ drop again to update' : 'Drop the seal here'} accepts={(i: DragItem) => i.payload === 'seal'} onDrop={() => void seal()} width={240} height={110} />
        <p className="flex-1 min-w-[200px] text-sm text-cream">{sealed ? 'Your answers are sealed and count in the score.' : 'Not sealed yet. Your answers are only kept once the seal is dropped.'}</p>
      </div>

      {/* 6 Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUESTIONS.map((q) => {
          const current = answers[q.id] ?? 3;
          return (
            <div
              key={q.id}
              className="rl-panel p-5 border-2 border-twilight flex flex-col justify-between"
            >
              <div>
                <h4 className="font-display text-xl text-soft tracking-wide">{q.title}</h4>
                <p className="mt-1.5 text-xs text-cream/90 leading-relaxed">{q.subtitle}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-display text-dim mb-2 uppercase">
                  <span>{q.lowLabel}</span>
                  <span>{q.highLabel}</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isSelected = current === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleSelect(q.id, level)}
                        className={`h-9 font-display text-lg transition-all border-2 ${
                          isSelected
                            ? 'bg-gold text-night border-gold shadow-[0_2px_0_#9a7000] scale-[1.03]'
                            : 'bg-[#151438] text-cream border-twilight hover:border-lavender'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
