import { useState } from 'react';
import type { Project } from '@/backend/domain/types';
import { liveAnalysis } from '@/backend/domain/insights';
import { ChevronDown, ChevronUp, Layers, User, Globe, HelpCircle } from 'lucide-react';
import { PATHS } from '@/backend/domain/paths';

export function YourScoreStep({ project }: { project: Project }) {
  const analysis = liveAnalysis(project);
  const [openGroup, setOpenGroup] = useState<'project' | 'you' | 'world' | null>('project');

  // Breakdown calculations
  // 1. The Project (Progress, Assets, Recency) - Max 40
  const progressPts = Math.round((project.progress / 100) * 15);
  const assetsPts = Math.min(15, (project.assets.length || 0) * 4);
  const recencyPts = project.lastWorkedAt
    ? Math.max(2, 10 - Math.min(8, Math.floor((Date.now() - new Date(project.lastWorkedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))))
    : 5;
  const projectScore = Math.min(40, progressPts + assetsPts + recencyPts);

  // 2. You (Interest + Questionnaire) - Max 35
  const interestPts = ((project.currentInterest ?? 3) / 5) * 15;
  const qAnswers = project.questionnaireAnswers;
  const qAvg = qAnswers
    ? Object.values(qAnswers).reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 3), 0) / Math.max(1, Object.keys(qAnswers).length)
    : 3;
  const questionPts = Math.round((qAvg / 5) * 20);
  const youScore = Math.min(35, Math.round(interestPts + questionPts));

  // 3. The World (Market repos & saturation signals) - Max 25
  const evaluated = project.evaluatedRepos ?? [];
  const solved = evaluated.filter((r) => r.verdict === 'solved').length;
  const inspiring = evaluated.filter((r) => r.verdict === 'inspiring').length;
  // If many already solved, world opportunity drops; if inspiring found, it rises
  const worldScore = Math.max(5, Math.min(25, 15 + inspiring * 3 - solved * 4));

  const totalScore = projectScore + youScore + worldScore;

  // Short verdict
  const verdict =
    totalScore >= 75
      ? { text: `Strong Foundation (${totalScore}/100) — Prime candidate to Continue or Restart with high conviction.`, color: '#a8e6a1', rec: 'continue' as const }
      : totalScore >= 50
        ? { text: `Solid Raw Material (${totalScore}/100) — Best suited for a Pivot or Repurpose of key assets.`, color: '#ffd166', rec: 'pivot' as const }
        : { text: `High Fatigue / Saturated (${totalScore}/100) — Repurpose reusable parts or let it rest in the Archive.`, color: '#ff9db5', rec: 'archive' as const };

  const recPath = analysis.recommendation?.path ?? verdict.rec;
  const recMeta = PATHS[recPath];

  return (
    <div className="space-y-6">
      {/* Big Score Header & Verdict */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="font-display text-sm tracking-widest text-dim block uppercase">COMPREHENSIVE RELAUNCH SCORE</span>
            <h3 className="font-display text-4xl text-soft leading-none">THE THREE-SOURCE VERDICT</h3>
            <p className="text-base text-cream max-w-xl mt-1">
              {verdict.text}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="num font-display text-7xl text-gold leading-none">{totalScore}</span>
            <span className="font-display text-2xl text-dim">/ 100</span>
          </div>
        </div>

        {/* Recommended Signal Card */}
        <div className="mt-6 p-4 bg-[#151438] border-2 border-lavender/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 font-display text-xl text-night uppercase"
              style={{ background: recMeta.accent }}
            >
              Recommended: {recMeta.label}
            </div>
            <p className="text-sm text-cream">{recMeta.tagline}</p>
          </div>
          <span className="text-xs text-dim italic">Built from your project facts, gut check, and market signals</span>
        </div>
      </div>

      {/* 3 Plain Expandable Groups Adding Up to Total */}
      <div className="space-y-3">
        {/* Group 1: The Project */}
        <div className="rl-panel border-2 border-twilight overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenGroup(openGroup === 'project' ? null : 'project')}
            className="w-full p-4 bg-[#151438] flex items-center justify-between hover:bg-[#1c1a4b] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Layers className="size-5 text-sky" />
              <div>
                <span className="font-display text-2xl text-soft block leading-none">1. THE PROJECT</span>
                <span className="text-xs text-dim">Progress, reusable assets, and recency</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="num font-display text-2xl text-sky">{projectScore} / 40 pts</span>
              {openGroup === 'project' ? <ChevronUp className="size-5 text-dim" /> : <ChevronDown className="size-5 text-dim" />}
            </div>
          </button>

          {openGroup === 'project' && (
            <div className="p-5 border-t border-white/10 space-y-3 text-sm text-cream bg-[#12112e]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span>Code & Feature Progress ({project.progress}%)</span>
                <span className="font-bold text-soft">{progressPts} / 15 pts</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span>Recorded Assets ({project.assets.length} categorized assets)</span>
                <span className="font-bold text-soft">{assetsPts} / 15 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Recency & Staleness Factor</span>
                <span className="font-bold text-soft">{recencyPts} / 10 pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Group 2: You */}
        <div className="rl-panel border-2 border-twilight overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenGroup(openGroup === 'you' ? null : 'you')}
            className="w-full p-4 bg-[#151438] flex items-center justify-between hover:bg-[#1c1a4b] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <User className="size-5 text-coral" />
              <div>
                <span className="font-display text-2xl text-soft block leading-none">2. YOU</span>
                <span className="text-xs text-dim">Self-reported interest and 6-question gut check</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="num font-display text-2xl text-coral">{youScore} / 35 pts</span>
              {openGroup === 'you' ? <ChevronUp className="size-5 text-dim" /> : <ChevronDown className="size-5 text-dim" />}
            </div>
          </button>

          {openGroup === 'you' && (
            <div className="p-5 border-t border-white/10 space-y-3 text-sm text-cream bg-[#12112e]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span>Interest Level Rating ({project.currentInterest ?? 3}/5)</span>
                <span className="font-bold text-soft">{Math.round(interestPts)} / 15 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Questionnaire Conviction & Bandwidth (Avg {qAvg.toFixed(1)}/5)</span>
                <span className="font-bold text-soft">{questionPts} / 20 pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Group 3: The World */}
        <div className="rl-panel border-2 border-twilight overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenGroup(openGroup === 'world' ? null : 'world')}
            className="w-full p-4 bg-[#151438] flex items-center justify-between hover:bg-[#1c1a4b] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-mint" />
              <div>
                <span className="font-display text-2xl text-soft block leading-none">3. THE WORLD</span>
                <span className="text-xs text-dim">Market signals, inspiring references, and saturation</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="num font-display text-2xl text-mint">{worldScore} / 25 pts</span>
              {openGroup === 'world' ? <ChevronUp className="size-5 text-dim" /> : <ChevronDown className="size-5 text-dim" />}
            </div>
          </button>

          {openGroup === 'world' && (
            <div className="p-5 border-t border-white/10 space-y-3 text-sm text-cream bg-[#12112e]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span>Inspiring References Saved (+{inspiring * 3} pts)</span>
                <span className="font-bold text-soft">{inspiring} saved</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Direct Competition / Already Solved Blockers (-{solved * 4} pts)</span>
                <span className="font-bold text-soft">{solved} marked</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Philosophy Footnote */}
      <div className="p-4 bg-night/80 border border-twilight/50 flex items-center gap-3 text-xs text-dim">
        <HelpCircle className="size-4 shrink-0 text-gold" />
        <span>
          <strong>Guide, Not Prediction:</strong> The score compiles your observable facts and feelings. It is designed to reveal hidden clarity, but the final choice at the crossroads is always yours.
        </span>
      </div>
    </div>
  );
}
