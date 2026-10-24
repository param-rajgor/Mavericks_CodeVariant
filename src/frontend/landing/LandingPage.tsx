import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { demoProjects } from '@/backend/domain/seed';
import { landingProjects, toStone } from '@/frontend/graveyard/stone';
import { JourneyLanding } from './journey/JourneyLanding';
import { StaticLanding } from './StaticLanding';

interface LandingPageProps {
  /** Walk into the graveyard, optionally with one project already selected. */
  onEnter: (selectId?: string) => void;
}

/**
 * The landing page is a scroll-driven story: a little ghost walks through the graveyard, reaches a crossroads and
 * finds a sunrise. With reduced motion it is the still first screen, followed by the same story as plain text.
 */
export function LandingPage({ onEnter }: LandingPageProps) {
  const { projects } = useProjects();
  const reduced = useReducedMotion();
  // With nothing saved yet the stones show the sample set, so the first screen is never empty.
  const stones = useMemo(() => landingProjects(projects.length ? projects : demoProjects()).map((p) => toStone(p)), [projects]);
  return reduced ? <StaticLanding onEnter={onEnter} stones={stones} /> : <JourneyLanding stones={stones} onEnter={onEnter} />;
}
