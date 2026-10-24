import { useMemo, type ReactNode } from 'react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useChrome } from '@/frontend/shell/AppChrome';
import { Link } from '@/frontend/routing/router';
import { PageHeader } from '@/frontend/ui/primitives';
import { Code2, Database, FileText, FlaskConical, Palette, type LucideIcon } from 'lucide-react';
import { STATUS_ORDER, STATUS_UI, insightsOf } from '@/backend/domain/insights';
import { PATHS } from '@/backend/domain/paths';
import type { Project, Status } from '@/backend/domain/types';

const ASSET_COLOR: Record<string, string> = { code: '#9fb4ee', design: '#edb0d5', research: '#ffd166', data: '#9ce6bd', documentation: '#f6b9ab' };
const ASSET_ICON: Record<string, LucideIcon> = { code: Code2, design: Palette, research: FlaskConical, data: Database, documentation: FileText };

function Panel({ title, to, children, className = '', note }: { title: string; to?: string; children: ReactNode; className?: string; note?: ReactNode }) {
  return (
    <section className={`rl-panel flex flex-col p-5 ${className}`} aria-label={title}>
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold leading-tight text-soft">{title}</h2>
        {to && (
          <Link to={to} className="whitespace-nowrap text-[13px] font-extrabold text-gold underline-offset-4 hover:underline">
            View projects →
          </Link>
        )}
      </header>
      {children}
      {note && <p className="mt-auto pt-4 text-sm text-cream">{note}</p>}
    </section>
  );
}

function Block({ status, label }: { status: Status; label?: string }) {
  return <span title={label} className="block h-full min-h-0 flex-1 rounded-[2px]" style={{ background: STATUS_UI[status].dot }} />;
}

function StatCard({ label, value, dot, highlight }: { label: string; value: number; dot?: string; highlight?: boolean }) {
  return (
    <div className="rl-panel px-5 py-4" style={highlight ? { borderColor: '#c9a8ff', boxShadow: '0 5px 0 #0d0e2b, 0 0 0 2px #a982f2 inset' } : undefined}>
      <p className="flex items-center gap-2 text-[15px] font-extrabold text-soft">
        {dot && <span aria-hidden className="size-3.5 shrink-0" style={{ background: dot }} />}
        {label}
      </p>
      <p className="mt-2 font-title text-5xl font-bold leading-none" style={{ color: dot ?? '#fff9f2' }}>
        {value}
      </p>
    </div>
  );
}

export function InsightsPage() {
  const { projects } = useProjects();
  const { openDetail } = useChrome();
  const ins = useMemo(() => insightsOf(projects), [projects]);
  const pct = (n: number) => (ins.total ? Math.round((n / ins.total) * 100) : 0);
  const maxBucket = Math.max(1, ...ins.activity.map((b) => b.projects.length));
  const maxAsset = Math.max(1, ...ins.assets.map((a) => a.count));
  const ordered = useMemo(() => STATUS_ORDER.flatMap((s) => projects.filter((p) => p.status === s)), [projects]);
  const biggest = STATUS_ORDER.reduce((a, b) => (ins.counts[b] > ins.counts[a] ? b : a), 'active' as Status);
  const worth = ins.scatter.filter((s) => (s.interest ?? 0) >= 4 && s.progress <= 45).map((s) => s.project);

  const statusNote =
    ins.total === 0
      ? 'Log a project to see how your ideas are spread out.'
      : ins.counts.stalled * 3 >= ins.total
        ? 'A third or more of your ideas are stalled — that’s a pause, not a verdict.'
        : `Most of your ideas are ${STATUS_UI[biggest].filter.toLowerCase()}. One block = one project.`;

  return (
    <div className="mx-auto max-w-[88rem]">
      <div className="relative">
        <PageHeader title="Insights" subtitle="See the patterns behind your unfinished ideas." />

      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 ">
        <StatCard label="Total projects" value={ins.total} />
        <StatCard label="Active" value={ins.counts.active} dot={STATUS_UI.active.dot} />
        <StatCard label="Stalled" value={ins.counts.stalled} dot={STATUS_UI.stalled.dot} />
        <StatCard label="Archived" value={ins.counts.archived} dot={STATUS_UI.archived.dot} />
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Ready for review" value={ins.ready} dot="#c9a8ff" highlight />
        </div>
      </div>
      <p className="mt-3 font-mono text-[13px] text-cream [text-shadow:0_2px_0_#0d0e2b]">
        Based on the {ins.total} projects you’ve logged
        {ins.noAssetInfo > 0 && ` · ${ins.noAssetInfo} ${ins.noAssetInfo === 1 ? 'is' : 'are'} missing asset details, so asset counts may be low`}.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_20rem]">
        <Panel title="Project Status Distribution" to="/graveyard" note={statusNote}>
          <div className="flex h-24 gap-1.5" role="img" aria-label={STATUS_ORDER.map((s) => `${STATUS_UI[s].filter} ${ins.counts[s]}`).join(', ')}>
            {ordered.map((p) => (
              <Block key={p.id} status={p.status} label={`${p.name}: ${STATUS_UI[p.status].filter}`} />
            ))}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-[15px] font-bold text-cream">
                <span aria-hidden className="size-4 shrink-0" style={{ background: STATUS_UI[s].dot }} />
                {STATUS_UI[s].filter} · {ins.counts[s]} <span className="font-medium text-dim">({pct(ins.counts[s])}%)</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Project Activity"
          to="/graveyard"
          note={
            ins.untouchedOver30 > 0
              ? `${ins.untouchedOver30} ${ins.untouchedOver30 === 1 ? 'idea hasn’t' : 'ideas haven’t'} been touched in over a month. They may be ready for a gentle review — no rush.`
              : 'Everything has been touched recently. Nicely done.'
          }
        >
          <p className="text-sm text-dim">When each project was last worked on</p>
          <div className="mt-2 flex h-36 items-end justify-between gap-3 px-1" role="img" aria-label={ins.activity.map((b) => `${b.label}: ${b.projects.length}`).join(', ')}>
            {ins.activity.map((b) => (
              <div key={b.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-sm font-bold text-soft">{b.projects.length}</span>
                <div className="flex w-full max-w-14 flex-col-reverse gap-[3px]" style={{ height: `${(b.projects.length / maxBucket) * 100}%`, minHeight: b.projects.length ? 8 : 2 }}>
                  {b.projects.length === 0 ? (
                    <span className="h-0.5 w-full bg-rule" />
                  ) : (
                    b.projects.map((p) => <Block key={p.id} status={p.status} label={`${p.name}: ${STATUS_UI[p.status].filter}`} />)
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-3 px-1 text-sm text-cream">
            {ins.activity.map((b) => (
              <span key={b.key} className="flex-1 text-center">
                {b.label}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Projects Worth Revisiting" className="lg:col-span-2 xl:col-span-1 xl:row-span-2" note="Scores are provisional when details are missing. Open any project to see how its score was built.">
          <p className="mb-4 text-sm text-dim">Ranked by the Relaunch Score — a guide built from 5 visible factors, not a prediction of success.</p>
          {ins.revisit.length === 0 ? (
            <p className="text-sm text-dim">Add a few details to a project and it will show up here.</p>
          ) : (
            <ul className="space-y-3">
              {ins.revisit.map((r) => (
                <li key={r.project.id}>
                  <button type="button" onClick={() => openDetail(r.project.id)} className="w-full  bg-panel-2 p-3.5 text-left border-2 border-twilight transition-transform hover:-translate-y-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-lg font-extrabold text-soft">{r.project.name}</span>
                      <span className="font-mono text-sm font-bold text-gold">Score {r.score}</span>
                    </span>
                    {r.path && (
                      <span className="mt-2 inline-block  border-2 border-night px-2.5 py-0.5 text-sm font-extrabold text-ink" style={{ background: PATHS[r.path].accent }}>
                        {PATHS[r.path].label}
                      </span>
                    )}
                    <span className="mt-2 block text-sm leading-snug text-cream">{r.why}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Reusable Assets" to="/graveyard">
          <p className="text-sm text-dim">Projects that contain each kind of asset (of {ins.total})</p>
          <ul className="mt-4 space-y-4">
            {ins.assets.map((a) => (
              <li key={a.key} className="flex items-center gap-3">
                <span className="w-8 shrink-0">
                  {(() => { const I = ASSET_ICON[a.key]; return <I size={22} color={ASSET_COLOR[a.key]} aria-hidden="true" />; })()}
                </span>
                <span className="w-24 shrink-0 text-[15px] font-extrabold text-soft">{a.label}</span>
                <span className="h-4 flex-1  bg-deep" role="img" aria-label={`${a.label}: ${a.count} of ${ins.total}`}>
                  <span className="block h-full " style={{ width: `${(a.count / maxAsset) * 100}%`, background: ASSET_COLOR[a.key] }} />
                </span>
                <span className="w-6 text-right font-mono text-sm font-bold text-soft">{a.count}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Interest and Progress"
          to="/graveyard"
          note="Up = more interest, right = more progress. High interest with little progress is often worth another look."
        >
          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-1 text-sm text-cream">
              <span>High</span>
              <span>Med</span>
              <span>Low</span>
            </div>
            <div className="relative h-52 flex-1  bg-deep border-2 border-twilight" role="img" aria-label={`Scatter of ${ins.scatter.length} open projects by interest and progress. Worth a look: ${worth.map((p) => p.name).join(', ') || 'none'}.`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <span key={i} aria-hidden className="absolute inset-y-0 w-px bg-[#1c1d5a]" style={{ left: `${i * 10}%` }} />
              ))}
              <span aria-hidden className="absolute left-[2%] top-[4%] h-[40%] w-[38%] border-2 border-dashed border-gold" />
              <span aria-hidden className="absolute left-[4%] top-[5%] font-mono text-[0.85rem] font-bold text-gold">
                Worth a look
              </span>
              {ins.scatter.map(({ project, interest, progress }) => {
                const i = interest ?? 3;
                const x = 3 + (progress / 100) * 92;
                const y = 92 - ((i - 1) / 4) * 82;
                const hot = worth.includes(project);
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => openDetail(project.id)}
                    title={`${project.name}: ${progress}% done, interest ${i} of 5`}
                    aria-label={`${project.name}, ${progress}% done, interest ${i} of 5`}
                    className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 outline-offset-4 hover:scale-125"
                    style={{ left: `${x}%`, top: `${y}%`, background: STATUS_UI[project.status].dot, boxShadow: '0 0 0 2px #101240' }}
                  >
                    {hot && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[0.85rem] font-bold text-soft">{project.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="ml-12 mt-1 flex justify-between text-sm text-cream">
            <span>0%</span>
            <span>Progress →</span>
            <span>100%</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export type { Project };
