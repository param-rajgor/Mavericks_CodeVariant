import { useState, useMemo, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Header } from "@/src/landing/components/Header";
import { PixelLandscapeBackground } from "@/src/landing/components/PixelLandscapeBackground";
import { PixelBackground } from "@/src/landing/components/PixelBackground";
import { GhostCursor } from "@/src/landing/components/GhostCursor";
import { HeroSection } from "@/src/landing/sections/HeroSection";
import { ProjectGraveyardSection } from "@/src/landing/sections/ProjectGraveyardSection";
import { FivePathsSection } from "@/src/landing/sections/FivePathsSection";
import { PixelFooter } from "@/src/landing/sections/PixelFooter";
import { ProjectCreateDialog, type NewProjectInput } from "@/src/landing/components/ProjectCreateDialog";
import { DEMO_PROJECTS, type DemoProjectExtra } from "@/src/landing/data/demoProjects";
import type { PathId } from "@/src/landing/data/types";
import { scrollToId } from "@/src/landing/lib/scroll";
import { navigate } from "@/src/lib/router";
import { useProjects } from "@/src/store/ProjectsContext";
import { useToast } from "@/src/components/Toast";

/**
 * Faithfully recreates the original pixel-art landing page from the reference video:
 * - Opening hero with deep twilight sky, layered mountains, glowing sunset, cherry blossom tree,
 *   warm lanterns, sleeping cat, 4 landscape tombstones, and bottom statistics bar.
 * - Interactive Ghost Cursor mascot reacting to hovers and clicks.
 * - Interactive Project Graveyard section matching the video demo (filtering, search, inspect card).
 * - Five Revival Paths decision section and closing pixel footer.
 * - Integrated with the real Relaunch app state and IndexedDB storage.
 */
export function LandingPage() {
  const { projects: storeProjects, actions } = useProjects();
  const toast = useToast();

  const [creatingProject, setCreatingProject] = useState(false);
  const [localProjects, setLocalProjects] = useState<DemoProjectExtra[]>(DEMO_PROJECTS);
  const [activePathId, setActivePathId] = useState<string>(DEMO_PROJECTS[0].id);

  // Merge store projects with demo projects if the user has added any real ones
  const allProjects = useMemo(() => {
    if (storeProjects && storeProjects.length > 0) {
      // Map user projects to demo format
      const userMapped: DemoProjectExtra[] = storeProjects.map((sp) => ({
        id: sp.id,
        name: sp.name,
        description: sp.description,
        status:
          sp.status === "active"
            ? "In Progress"
            : sp.status === "stalled"
            ? "Stalled"
            : sp.status === "archived"
            ? "Archived"
            : "To Revisit",
        lastWorked: "Recently",
        progress: sp.progress,
        tags: sp.tags,
        assets: sp.assets,
        icon: sp.domain === "Software" ? "code" : sp.domain === "Business" ? "package" : "sparkles",
        nextStep: (sp.recommendedPath as PathId) ?? "continue",
        stalledReason: sp.stallReasonDetails || sp.stallReason || undefined,
        interest: (sp.currentInterest ?? 0) >= 4 ? "High" : (sp.currentInterest ?? 0) === 3 ? "Medium" : "Low",
        sample: false,
      }));

      // Combine user projects and reference demo projects
      const existingNames = new Set(userMapped.map((p) => p.name.toLowerCase()));
      const uniqueLocal = localProjects.filter((p) => !existingNames.has(p.name.toLowerCase()));
      return [...userMapped, ...uniqueLocal];
    }
    return localProjects;
  }, [storeProjects, localProjects]);

  // Counts for hero stats bar
  const restingCount = allProjects.length;
  const reviveCount = allProjects.filter((p) => p.status === "Stalled" || p.status === "To Revisit").length;
  const newIdeasCount = allProjects.filter((p) => !p.sample).length + 1;

  // Actions
  const handleEnterGraveyard = () => {
    scrollToId("graveyard");
  };

  const handleSelectProject = (projectId: string) => {
    scrollToId("graveyard");
    setActivePathId(projectId);
  };

  const handleOpenAppProject = (projectId: string) => {
    // If it's a real project in store, navigate to its page; otherwise navigate to overview
    const isReal = storeProjects.some((p) => p.id === projectId);
    if (isReal) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate(`/projects`);
    }
  };

  const handleCreateProjectSubmit = async (input: NewProjectInput) => {
    try {
      // Add to local state immediately
      const newProj: DemoProjectExtra = {
        id: `user-${Date.now()}`,
        name: input.name,
        description: input.description,
        status: input.status,
        lastWorked: "Just now",
        progress: 20,
        tags: ["Personal", "Graveyard"],
        assets: input.assets,
        icon: "sparkles",
        nextStep: "continue",
        stalledReason: input.reason,
        interest: input.interest,
        sample: false,
      };

      setLocalProjects((prev) => [newProj, ...prev]);
      setCreatingProject(false);

      // Also persist to store
      await actions.create({
        name: input.name,
        description: input.description,
        domain: "Software",
        tags: ["Graveyard"],
        startedAt: new Date().toISOString().split("T")[0],
        lastWorkedAt: new Date().toISOString().split("T")[0],
        status: input.status === "In Progress" ? "active" : "stalled",
        progress: 20,
        completedText: "Concept logged",
        remainingText: "Review revival steps",
        assets: ["code"],
        assetNotes: "",
        stallReason: "other",
        stallReasonDetails: input.reason,
        currentInterest: input.interest === "High" ? 5 : input.interest === "Medium" ? 3 : 2,
        interestNote: "",
      });

      toast.success(
        "Project planted in the graveyard!",
        `"${input.name}" has been laid to rest safely in your local browser storage.`
      );

      // Scroll to graveyard to view the new tombstone
      window.setTimeout(() => scrollToId("graveyard"), 100);
    } catch (err) {
      toast.error("Could not plant project", err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleChoosePath = useCallback(
    async (projectId: string, path: PathId) => {
      setLocalProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, nextStep: path } : p))
      );
      toast.info("Path assigned", `Project updated with the ${path.toUpperCase()} path.`);
    },
    [toast]
  );

  return (
    <div className="landing-root min-h-screen bg-navy text-soft selection:bg-lavender selection:text-navy">
      {/* Clean Handcrafted Pixel Art Landscape Background (No baked text or blurry duplicate buttons) */}
      <PixelLandscapeBackground />

      {/* Floating Stars and Golden Fireflies */}
      <PixelBackground />

      {/* The Ghost Cursor Mascot */}
      <GhostCursor />

      {/* Top Header Navigation */}
      <Header
        onGetStarted={() => setCreatingProject(true)}
        onLogin={() =>
          toast.info(
            "Local-First Workspace",
            "No sign in required! All your projects and decisions remain in your browser."
          )
        }
      />

      {/* Main Page Flow */}
      <main id="main">
        {/* 1. Recreated Opening Hero Scene matching video */}
        <HeroSection
          onEnterGraveyard={handleEnterGraveyard}
          onSelectProject={handleSelectProject}
          projects={allProjects}
          restingCount={restingCount}
          reviveCount={reviveCount}
          newIdeasCount={newIdeasCount}
        />

        {/* 2. Interactive Project Graveyard matching video 00:11 - 00:28 */}
        <ProjectGraveyardSection
          projects={allProjects}
          onOpenAppProject={handleOpenAppProject}
          onPlantProject={() => setCreatingProject(true)}
        />

        {/* 3. The Five Revival Paths */}
        <FivePathsSection
          projects={allProjects}
          activeId={activePathId}
          onActiveChange={setActivePathId}
          onChoose={handleChoosePath}
        />
      </main>

      {/* Footer */}
      <PixelFooter
        onGetStarted={() => navigate("/app")}
        onNotify={(msg) => toast.info("Notice", msg)}
      />

      {/* Dialog for Planting New Projects */}
      <AnimatePresence>
        {creatingProject && (
          <ProjectCreateDialog
            onClose={() => setCreatingProject(false)}
            onSubmit={handleCreateProjectSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
