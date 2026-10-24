import { useState, useMemo } from 'react';
import type { Project, SavedRepo } from '@/backend/domain/types';
import { ExternalLink, Sparkles, CheckCircle2, Bookmark, EyeOff, Search } from 'lucide-react';
import { useProjects } from '@/backend/store/ProjectsContext';

// Realistic sample repos based on domains & tags
const REPO_CATALOG: Record<string, Omit<SavedRepo, 'verdict'>[]> = {
  Software: [
    { id: 'sw-1', name: 'supabase/realtime', url: 'https://github.com/supabase/realtime', stars: 6200, description: 'Listen to your PostgreSQL database in real-time via websockets.' },
    { id: 'sw-2', name: 'tldraw/tldraw', url: 'https://github.com/tldraw/tldraw', stars: 34100, description: 'A tiny canvas library for React and infinite whiteboard experiences.' },
    { id: 'sw-3', name: 'shadcn/ui', url: 'https://github.com/shadcn-ui/ui', stars: 71800, description: 'Beautifully designed components that you can copy and paste into your apps.' },
    { id: 'sw-4', name: 'nocodb/nocodb', url: 'https://github.com/nocodb/nocodb', stars: 45200, description: 'Open Source Airtable Alternative turns databases into smart spreadsheets.' },
  ],
  Academic: [
    { id: 'ac-1', name: 'papers-we-love/papers-we-love', url: 'https://github.com/papers-we-love/papers-we-love', stars: 84000, description: 'Community dedicated to reading and discussing academic computer science papers.' },
    { id: 'ac-2', name: 'academicpages/academicpages.github.io', url: 'https://github.com/academicpages/academicpages.github.io', stars: 12400, description: 'A personal academic website template based on Jekyll.' },
    { id: 'ac-3', name: 'OpenAlex/openalex-api', url: 'https://github.com/ourresearch/openalex-api', stars: 1100, description: 'An index of hundreds of millions of scholarly research items.' },
  ],
  Creative: [
    { id: 'cr-1', name: 'aseprite/aseprite', url: 'https://github.com/aseprite/aseprite', stars: 25400, description: 'Animated sprite editor & pixel art tool for game developers.' },
    { id: 'cr-2', name: 'fabricjs/fabric.js', url: 'https://github.com/fabricjs/fabric.js', stars: 28300, description: 'Javascript Canvas Library, SVG-to-Canvas (& canvas-to-SVG) Parser.' },
    { id: 'cr-3', name: 'pixijs/pixijs', url: 'https://github.com/pixijs/pixijs', stars: 43100, description: 'The HTML5 Creation Engine: create beautiful digital content with the fastest 2D WebGL renderer.' },
  ],
  Business: [
    { id: 'bs-1', name: 'twentyhq/twenty', url: 'https://github.com/twentyhq/twenty', stars: 23100, description: 'Building a modern alternative to Salesforce, accessible to all.' },
    { id: 'bs-2', name: 'medusajs/medusa', url: 'https://github.com/medusajs/medusa', stars: 27900, description: 'The open-source Shopify alternative modular commerce platform.' },
    { id: 'bs-3', name: 'calcom/cal.com', url: 'https://github.com/calcom/cal.com', stars: 32600, description: 'Scheduling infrastructure for everyone.' },
  ],
  Research: [
    { id: 'rs-1', name: 'vllm-project/vllm', url: 'https://github.com/vllm-project/vllm', stars: 31200, description: 'A high-throughput and memory-efficient LLM inference engine.' },
    { id: 'rs-2', name: 'karpathy/nanoGPT', url: 'https://github.com/karpathy/nanoGPT', stars: 38400, description: 'The simplest, fastest repository for training/finetuning medium-sized GPTs.' },
    { id: 'rs-3', name: 'facebookresearch/llama', url: 'https://github.com/facebookresearch/llama', stars: 58000, description: 'Inference code for LLaMA models.' },
  ],
};

const DEFAULT_REPOS: Omit<SavedRepo, 'verdict'>[] = [
  { id: 'def-1', name: 'excalidraw/excalidraw', url: 'https://github.com/excalidraw/excalidraw', stars: 85200, description: 'Virtual whiteboard for sketching hand-drawn like diagrams.' },
  { id: 'def-2', name: 'remix-run/react-router', url: 'https://github.com/remix-run/react-router', stars: 54100, description: 'Declarative routing for React web applications.' },
  { id: 'def-3', name: 'ant-design/ant-design', url: 'https://github.com/ant-design/ant-design', stars: 92400, description: 'An enterprise-class UI design language and React UI library.' },
];

export function LookAroundStep({ project }: { project: Project }) {
  const { actions } = useProjects();
  const [query, setQuery] = useState('');

  // Initial evaluations from project or empty
  const [evals, setEvals] = useState<Record<string, 'solved' | 'inspiring' | 'irrelevant'>>(() => {
    const map: Record<string, 'solved' | 'inspiring' | 'irrelevant'> = {};
    project.evaluatedRepos?.forEach((r) => {
      map[r.id] = r.verdict;
    });
    return map;
  });

  const baseCatalog = REPO_CATALOG[project.domain] ?? DEFAULT_REPOS;
  const filtered = useMemo(() => {
    if (!query.trim()) return baseCatalog;
    const q = query.toLowerCase();
    return baseCatalog.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [baseCatalog, query]);

  const setVerdict = async (repo: Omit<SavedRepo, 'verdict'>, verdict: 'solved' | 'inspiring' | 'irrelevant') => {
    const updated = { ...evals, [repo.id]: verdict };
    setEvals(updated);

    // Save to project
    const repoList: SavedRepo[] = baseCatalog
      .filter((r) => updated[r.id])
      .map((r) => ({ ...r, verdict: updated[r.id]! }));

    await actions.saveReposEvaluation(project.id, repoList);
  };

  // Signal calculations
  const solvedCount = Object.values(evals).filter((v) => v === 'solved').length;
  const inspiringCount = Object.values(evals).filter((v) => v === 'inspiring').length;
  const irrelevantCount = Object.values(evals).filter((v) => v === 'irrelevant').length;

  const marketSignal = useMemo(() => {
    if (solvedCount >= 2) {
      return {
        label: 'Heavy Market Saturation',
        advice: 'Multiple existing projects already solve this exact problem cleanly. Strong signal pointing toward Pivot or Repurpose (reuse your unique components) rather than direct rebuild.',
        badgeColor: '#ff9db5',
      };
    }
    if (inspiringCount >= 1 && solvedCount === 0) {
      return {
        label: 'Inspiring Opportunity Window',
        advice: 'You have found high-quality references with no identical blockers. Strong signal pointing toward Continue or Restart with clear inspiration.',
        badgeColor: '#a8e6a1',
      };
    }
    return {
      label: 'Balanced Landscape',
      advice: 'The market has related components, but there is still room for your unique angle. Evaluate your internal conviction in the next step.',
      badgeColor: '#ffd166',
    };
  }, [solvedCount, inspiringCount]);

  return (
    <div className="space-y-6">
      {/* Market Signal Summary Box */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 text-gold" />
            <div>
              <h3 className="font-display text-2xl text-soft leading-none">THE WORLD: GITHUB SIGNALS</h3>
              <p className="text-sm text-dim mt-1">Review similar repos to determine market viability and capture inspiration.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 font-display text-lg tracking-wide text-night"
              style={{ background: marketSignal.badgeColor }}
            >
              {marketSignal.label}
            </span>
          </div>
        </div>

        <p className="mt-4 text-base text-cream leading-relaxed bg-[#151438] p-4 border-l-4 border-gold">
          {marketSignal.advice}
        </p>

        {/* Counter Pills */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-display tracking-wider">
          <span className="text-coral">Already Solved: {solvedCount}</span>
          <span className="text-mint">Inspiring Saved: {inspiringCount}</span>
          <span className="text-dim">Not Relevant: {irrelevantCount}</span>
        </div>
      </div>

      {/* Repos List */}
      <div className="rl-panel p-6 border-[3px] border-twilight shadow-[0_6px_0_#14122e]">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h4 className="font-display text-xl text-soft">SIMILAR OPEN SOURCE REPOSITORIES</h4>
          <div className="relative w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search related repos..."
              className="w-full bg-[#151438] border-2 border-twilight px-3 py-1.5 text-sm text-cream pl-8 outline-none focus:border-gold"
            />
            <Search className="size-4 text-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((repo) => {
            const current = evals[repo.id];
            return (
              <div
                key={repo.id}
                className="bg-[#151438] border-2 p-4 flex flex-col justify-between transition-all"
                style={{
                  borderColor:
                    current === 'solved' ? '#ff9db5' : current === 'inspiring' ? '#a8e6a1' : '#3a2f6e',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-lg text-gold hover:underline flex items-center gap-1.5"
                    >
                      <span>{repo.name}</span>
                      <ExternalLink className="size-3.5 opacity-75" />
                    </a>
                    <span className="num text-xs text-dim bg-night px-2 py-0.5 border border-twilight">
                      ★ {repo.stars.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-cream/90 leading-relaxed">{repo.description}</p>
                </div>

                {/* Feedback Chips */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-display text-dim uppercase">Signal:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setVerdict(repo, 'solved')}
                      className={`px-2 py-1 text-xs font-display flex items-center gap-1 border transition-all ${
                        current === 'solved'
                          ? 'bg-coral text-night border-coral font-bold'
                          : 'bg-[#1e1c48] text-coral border-coral/40 hover:border-coral'
                      }`}
                    >
                      <CheckCircle2 className="size-3" />
                      <span>Already Solved</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerdict(repo, 'inspiring')}
                      className={`px-2 py-1 text-xs font-display flex items-center gap-1 border transition-all ${
                        current === 'inspiring'
                          ? 'bg-mint text-night border-mint font-bold'
                          : 'bg-[#1e1c48] text-mint border-mint/40 hover:border-mint'
                      }`}
                    >
                      <Bookmark className="size-3" />
                      <span>Inspiring</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerdict(repo, 'irrelevant')}
                      className={`px-2 py-1 text-xs font-display flex items-center gap-1 border transition-all ${
                        current === 'irrelevant'
                          ? 'bg-dim text-night border-dim font-bold'
                          : 'bg-[#1e1c48] text-dim border-dim/40 hover:border-dim'
                      }`}
                    >
                      <EyeOff className="size-3" />
                      <span>Not Relevant</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
