import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NavBar } from '../components/nav/NavBar';
import { Scene } from '../components/scene/Scene';
import { Heading } from '../components/dashboard/Heading';
import { ProjectFoundPanel } from '../components/dashboard/ProjectFoundPanel';
import { ProjectDetailModal } from '../components/dashboard/ProjectDetailModal';
import { ControlBar } from '../components/dashboard/ControlBar';
import { Gravestone } from '../components/gravestone/Gravestone';
import { PROJECTS, LANDING_PROJECT_IDS, type Project } from '../data/projects';
import type { FilterId } from '../data/stats';

function matchesFilter(project: Project, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'stalled') return project.status === 'Stalled';
  if (filter === 'archived') return project.status === 'Archived';
  return project.status === 'In Progress' || project.status === 'To Revisit';
}

export function GraveyardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');

  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? null;
  const inspectedProject = PROJECTS.find((p) => p.id === inspectedId) ?? null;
  const query = search.trim().toLowerCase();

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: 96 }}>
      <Scene variant="dashboard" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <NavBar variant="dashboard" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '32px 32px 0' }}>
        <div style={{ position: 'relative' }}>
          <Heading />
          <AnimatePresence>
            {selectedProject && (
              <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <ProjectFoundPanel project={selectedProject} onInspect={() => setInspectedId(selectedProject.id)} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PROJECTS.map((project, i) => {
            const matches = matchesFilter(project, filter) && (query === '' || project.name.toLowerCase().includes(query));
            const isSharedWithLanding = (LANDING_PROJECT_IDS as readonly string[]).includes(project.id);
            const stone = (
              <Gravestone
                project={project}
                variant="dashboard"
                layoutId={`stone-${project.id}`}
                selected={selectedId === project.id}
                onClick={() => setSelectedId(project.id)}
                onOpenProject={() => setSelectedId(project.id)}
              />
            );
            return (
              <motion.div
                key={project.id}
                animate={{ opacity: matches ? 1 : 0.25, y: matches ? 0 : 10 }}
                transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
              >
                {isSharedWithLanding ? (
                  stone
                ) : (
                  // The 2 dashboard-only stones pop in after the shared ones glide into place (spec §5).
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.55, ease: 'easeOut' }}
                  >
                    {stone}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <ControlBar filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} />

      <ProjectDetailModal project={inspectedProject} onClose={() => setInspectedId(null)} />
    </div>
  );
}
