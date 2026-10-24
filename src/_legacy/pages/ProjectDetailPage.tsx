import { useState, type ReactNode } from 'react';
import { Archive, ArchiveRestore, FileQuestion, Pencil, Scale, Trash2, TrendingUp } from 'lucide-react';
import { analyzeProject, projectToInput } from '../domain/analysis';
import { formatDate, timeAgo } from '../domain/dates';
import { ASSET_META, INTEREST_LABELS, PATHS, STALL_REASON_META } from '../domain/paths';
import { navigate } from '../lib/router';
import { useProjects } from '../store/ProjectsContext';
import { Button, EmptyState, LinkButton, PageHeader, PathBadge, ProgressBar, SampleChip, SectionTitle, StatusBadge, TagList } from '../components/ui';
import { Tabs } from '../components/Tabs';
import { ScoreRing, ScoreStatusLabel } from '../components/ScoreCard';
import { TimelineList } from '../components/Timeline';
import { ArchiveDialog, DeleteDialog, EditDialog, ProgressDialog, RestoreDialog } from '../components/ProjectDialogs';

type TabId = 'overview' | 'work' | 'history';

export function MissingProject() {
  return (
    <EmptyState icon={FileQuestion} title="We could not find that project" action={<LinkButton to="/projects" variant="gold">Back to My Projects</LinkButton>}>
      It may have been deleted, or the link may be out of date. Your other projects are safe.
    </EmptyState>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rl-panel-flat p-4">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

const List = ({ items, empty }: { items: string[]; empty: string }) =>
  items.length ? (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((i, n) => (
        <li key={`${i}-${n}`}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted">{empty}</p>
  );

export function ProjectDetailPage({ id }: { id: string }) {
  const { get } = useProjects();
  const project = get(id);
  const [tab, setTab] = useState<TabId>('overview');
  const [dlg, setDlg] = useState<null | 'edit' | 'progress' | 'archive' | 'restore' | 'delete'>(null);

  if (!project) return <MissingProject />;

  const analysis = analyzeProject(projectToInput(project));
  const archived = project.status === 'archived';
  const chosen = project.selectedPath;
  const suggested = analysis.recommendation?.path ?? null;
  const close = () => setDlg(null);

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.description}
        actions={
          archived ? (
            <>
              <Button variant="gold" onClick={() => setDlg('restore')}>
                <ArchiveRestore aria-hidden className="size-4" /> Restore
              </Button>
              <Button onClick={() => setDlg('edit')}>
                <Pencil aria-hidden className="size-4" /> Edit Project
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setDlg('edit')}>
                <Pencil aria-hidden className="size-4" /> Edit Project
              </Button>
              <Button onClick={() => setDlg('progress')}>
                <TrendingUp aria-hidden className="size-4" /> Update Progress
              </Button>
              <LinkButton to={`/projects/${project.id}/decision`} variant="gold">
                <Scale aria-hidden className="size-4" /> View Decision
              </LinkButton>
              <Button variant="rose" onClick={() => setDlg('archive')}>
                <Archive aria-hidden className="size-4" /> Archive Project
              </Button>
            </>
          )
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="rl-panel space-y-3 p-4" aria-label="Project summary">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.isDemo && <SampleChip />}
            <span className="chip">{project.domain}</span>
          </div>
          <TagList tags={project.tags} />
          <ProgressBar value={project.progress} label="Completion" />
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-extrabold">Last worked</dt>
              <dd className="text-muted" title={formatDate(project.lastWorkedAt)}>{timeAgo(project.lastWorkedAt)}</dd>
            </div>
            <div>
              <dt className="font-extrabold">Started</dt>
              <dd className="text-muted">{formatDate(project.startedAt)}</dd>
            </div>
            <div>
              <dt className="font-extrabold">Current interest</dt>
              <dd className="text-muted">{project.currentInterest ? `${project.currentInterest}/5 · ${INTEREST_LABELS[project.currentInterest].label}` : 'Not rated'}</dd>
            </div>
          </dl>
        </section>

        <section className="rl-panel flex items-center gap-4 p-4" aria-label="Relaunch Score">
          <ScoreRing analysis={analysis} size={112} />
          <div className="min-w-0 space-y-2">
            <ScoreStatusLabel analysis={analysis} />
            <p className="text-xs text-muted">Relaunch Score. Open the decision page to see how it is made.</p>
          </div>
        </section>
      </div>

      <section className="mb-6 rounded-md border-2 p-4" style={{ borderColor: (chosen ?? suggested) ? PATHS[(chosen ?? suggested)!].accent : '#d9d3ee', background: (chosen ?? suggested) ? PATHS[(chosen ?? suggested)!].soft : '#fff' }} aria-label="Next step">
        <SectionTitle>Next step</SectionTitle>
        {chosen ? (
          <div className="space-y-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
              You chose <PathBadge path={chosen} size="md" />
            </p>
            <p className="text-sm">{PATHS[chosen].tagline}</p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm">
              {analysis.nextSteps.length && suggested === chosen ? analysis.nextSteps.map((s) => <li key={s}>{s}</li>) : PATHS[chosen].defaultSteps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
        ) : suggested ? (
          <div className="space-y-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
              Relaunch suggests <PathBadge path={suggested} size="md" />
              {analysis.status === 'provisional' && <span className="chip !bg-cream !text-[#6B4A00]">Provisional</span>}
            </p>
            <p className="text-sm">{analysis.recommendation!.reasons[0]}</p>
            {!archived && (
              <LinkButton to={`/projects/${project.id}/decision`} small className="mt-2">
                See why and choose a path
              </LinkButton>
            )}
          </div>
        ) : (
          <p className="text-sm">There is not enough information for a suggestion yet. Edit the project to add progress and why it stopped.</p>
        )}
      </section>

      <Tabs
        idBase="detail"
        label="Project sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'work', label: 'Built, remaining & assets' },
          { id: 'history', label: 'History', count: project.timeline.length },
        ]}
      />

      <div className="mt-4" role="tabpanel" id={`detail-panel-${tab}`} aria-labelledby={`detail-tab-${tab}`}>
        {tab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Block title="The idea">
              <p className="text-sm">{project.description}</p>
            </Block>
            <Block title="Why it stopped">
              <p className="text-sm font-bold">{project.stallReason ? STALL_REASON_META[project.stallReason].label : 'Not recorded'}</p>
              {project.stallReasonDetails && <p className="mt-1 text-sm text-muted">{project.stallReasonDetails}</p>}
            </Block>
            <Block title="Current interest">
              <p className="text-sm font-bold">{project.currentInterest ? `${project.currentInterest}/5 · ${INTEREST_LABELS[project.currentInterest].label}` : 'Not rated'}</p>
              {project.interestNote && <p className="mt-1 text-sm text-muted">{project.interestNote}</p>}
            </Block>
            {archived && (
              <Block title="Archive note">
                <p className="text-sm">{project.archiveNote || 'No note was added.'}</p>
                {project.archivedAt && <p className="mt-1 text-xs text-muted">Archived {formatDate(project.archivedAt)}</p>}
              </Block>
            )}
          </div>
        )}
        {tab === 'work' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Block title="What has been built">
              <List items={project.completedItems} empty="Nothing listed yet." />
            </Block>
            <Block title="What remains">
              <List items={project.remainingItems} empty="Nothing listed yet." />
            </Block>
            <Block title="Reusable assets">
              {project.assets.length ? (
                <ul className="flex flex-wrap gap-2">
                  {project.assets.map((a) => (
                    <li key={a} className="chip">{ASSET_META[a].label}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No reusable assets recorded.</p>
              )}
              {project.assetNotes && <p className="mt-2 text-sm text-muted">{project.assetNotes}</p>}
            </Block>
          </div>
        )}
        {tab === 'history' && (
          <div className="rl-panel-flat p-4 pl-8">
            {project.timeline.length ? <TimelineList rows={project.timeline.map((event) => ({ event }))} /> : <p className="text-sm text-muted">No history recorded yet.</p>}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-4 text-sm text-muted">
        <p>Want it gone entirely? Deleting is permanent and different from archiving.</p>
        <Button variant="ghost" small onClick={() => setDlg('delete')}>
          <Trash2 aria-hidden className="size-4" /> Delete permanently
        </Button>
      </div>

      <EditDialog project={project} open={dlg === 'edit'} onClose={close} />
      <ProgressDialog project={project} open={dlg === 'progress'} onClose={close} />
      <ArchiveDialog project={project} open={dlg === 'archive'} onClose={close} />
      <RestoreDialog project={project} open={dlg === 'restore'} onClose={close} />
      <DeleteDialog project={project} open={dlg === 'delete'} onClose={close} onDone={() => navigate('/projects')} />
    </>
  );
}
