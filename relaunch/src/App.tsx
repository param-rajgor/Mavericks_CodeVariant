import { AnimatePresence } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Header } from "@/src/components/Header";
import { PixelBackground } from "@/src/components/PixelBackground";
import { ProjectCreateDialog, type NewProjectInput } from "@/src/components/ProjectCreateDialog";
import { ProjectDetailDialog } from "@/src/components/ProjectDetailDialog";
import { ScrollVideoBackground } from "@/src/components/ScrollVideoBackground";
import { Toast } from "@/src/components/Toast";
import { DEMO_PROJECTS, suggestPath } from "@/src/data/demoProjects";
import type { PathId, Project, StatusFilter } from "@/src/data/types";
import { scrollToId } from "@/src/lib/scroll";
import { FivePathsSection } from "@/src/sections/FivePathsSection";
import { HeroSection } from "@/src/sections/HeroSection";
import { PixelFooter } from "@/src/sections/PixelFooter";
import { ProjectGraveyard } from "@/src/sections/ProjectGraveyard";

export default function App() {
  // All project data lives in React state only — nothing is persisted or sent anywhere.
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [activeId, setActiveId] = useState<string>(DEMO_PROJECTS[0].id);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const counter = useRef(0);

  const clearToast = useCallback(() => setToast(null), []);

  const choosePath = useCallback((projectId: string, path: PathId) => {
    setProjects((list) =>
      list.map((p) => (p.id === projectId ? { ...p, nextStep: path, nextStepNote: undefined } : p)),
    );
    setActiveId(projectId);
  }, []);

  const addProject = (input: NewProjectInput) => {
    counter.current += 1;
    const id = `user-${counter.current}`;
    const project: Project = {
      id,
      name: input.name,
      description: input.description,
      status: input.status,
      lastWorked: "Just now",
      assets: input.assets,
      icon: "sparkles",
      nextStep: suggestPath(input),
      stalledReason: input.reason,
      interest: input.interest,
      sample: false,
    };
    setProjects((list) => [...list, project]);
    setActiveId(id);
    setFilter("All");
    setQuery("");
    setCreating(false);
    setToast(`"${input.name}" now rests in the graveyard (demo — lives in this page's memory only).`);
    window.setTimeout(() => scrollToId("graveyard"), 60);
    window.setTimeout(() => setDetailId(id), 700);
  };

  const detail = projects.find((p) => p.id === detailId) ?? null;

  return (
    <>
      <ScrollVideoBackground />
      <PixelBackground />
      <Header onGetStarted={() => setCreating(true)} onLogin={() => setToast("Accounts aren't part of this demo — try Get Started to add a sample project.")} />
      <main>
        <HeroSection />
        <ProjectGraveyard
          projects={projects}
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
          onOpen={setDetailId}
          onAdd={() => setCreating(true)}
        />
        <FivePathsSection projects={projects} activeId={activeId} onActiveChange={setActiveId} onChoose={choosePath} />
      </main>
      <PixelFooter
        onGetStarted={() => setCreating(true)}
        onFilterJump={(f) => {
          setFilter(f);
          setQuery("");
        }}
        onNotify={setToast}
      />

      <AnimatePresence>
        {detail && (
          <ProjectDetailDialog
            key={detail.id}
            project={detail}
            onClose={() => setDetailId(null)}
            onChoosePath={choosePath}
            onSeeAllPaths={setActiveId}
          />
        )}
        {creating && <ProjectCreateDialog key="create" onClose={() => setCreating(false)} onSubmit={addProject} />}
      </AnimatePresence>
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}
