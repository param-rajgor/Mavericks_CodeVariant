import { useMemo, useState } from "react";
import { Header } from "@/src/landing/components/Header";
import { PixelBackground } from "@/src/landing/components/PixelBackground";
import { ScrollVideoBackground } from "@/src/landing/components/ScrollVideoBackground";
import { FivePathsSection } from "@/src/landing/sections/FivePathsSection";
import { HeroSection } from "@/src/landing/sections/HeroSection";
import { PixelFooter } from "@/src/landing/sections/PixelFooter";
import { ProjectGraveyard } from "@/src/landing/sections/ProjectGraveyard";
import { toLandingProject } from "@/src/landing/data/view";
import { PATH_BY_ID } from "@/src/landing/data/relaunchPaths";
import type { PathId, StatusFilter } from "@/src/landing/data/types";
import { navigate } from "@/src/lib/router";
import { useProjects } from "@/src/store/ProjectsContext";
import { useToast } from "@/src/components/Toast";

/**
 * The scroll-video landing page. It renders the user's real stored projects, and every
 * call to action leads into the working app.
 */
export function LandingPage() {
  const { projects, actions } = useProjects();
  const toast = useToast();
  const [activeId, setActiveId] = useState<string>("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");

  const view = useMemo(() => projects.map((p) => toLandingProject(p)), [projects]);
  const activeProjectId = view.some((p) => p.id === activeId) ? activeId : (view[0]?.id ?? "");

  const startNew = () => navigate("/projects/new");

  const choosePath = async (projectId: string, path: PathId): Promise<string> => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return "That project could not be found.";
    // Archiving asks for an optional note, so it continues on the decision screen.
    if (path === "archive") {
      navigate(`/projects/${projectId}/decision`);
      return "Opening the archive step, where you can add a note.";
    }
    try {
      await actions.choosePath(projectId, path);
      return `${project.name} → ${PATH_BY_ID[path].label}. Saved on this device.`;
    } catch (e) {
      toast.error("That did not save", `${e instanceof Error ? e.message : "Something went wrong."} Nothing was changed.`);
      return "Could not save that choice. Please try again.";
    }
  };

  return (
    <div className="landing-root min-h-screen bg-navy text-soft">
      <ScrollVideoBackground />
      <PixelBackground />
      <Header onGetStarted={startNew} />
      <main id="main">
        <HeroSection />
        <ProjectGraveyard
          projects={view}
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
          onOpen={(id) => navigate(`/projects/${id}`)}
          onAdd={startNew}
        />
        <FivePathsSection projects={view} activeId={activeProjectId} onActiveChange={setActiveId} onChoose={choosePath} />
      </main>
      <PixelFooter onGetStarted={startNew} />
    </div>
  );
}
