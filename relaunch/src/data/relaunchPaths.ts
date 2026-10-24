import type { PathId, RelaunchPath } from "./types";

export const RELAUNCH_PATHS: RelaunchPath[] = [
  {
    id: "continue",
    label: "Continue",
    tagline: "Build on what you've already created.",
    bestWhen: "Best when the project has meaningful progress and you still care about the outcome.",
    steps: ["Finish the core features.", "Improve the existing experience.", "Test the project with users."],
    color: "#A8E6A1",
    icon: "play",
  },
  {
    id: "restart",
    label: "Restart",
    tagline: "Start again with a smaller, clearer plan.",
    bestWhen: "Best when the idea still matters but the original approach is too complicated.",
    steps: ["Define a smaller MVP.", "Set a realistic timeline.", "Remove unnecessary scope."],
    color: "#FFAB83",
    icon: "rotate",
  },
  {
    id: "pivot",
    label: "Pivot",
    tagline: "Take the idea in a new direction.",
    bestWhen: "Best when the original direction is not working but the underlying idea still has potential.",
    steps: ["Reconsider the target audience.", "Change the approach.", "Preserve useful existing work."],
    color: "#A982F2",
    icon: "branch",
  },
  {
    id: "repurpose",
    label: "Repurpose",
    tagline: "Give your existing work a new purpose.",
    bestWhen: "Best when the code, designs, data, or research can be useful elsewhere.",
    steps: ["Reuse valuable code.", "Extract useful components.", "Turn research into a new project."],
    color: "#7FD4FF",
    icon: "layers",
  },
  {
    id: "archive",
    label: "Archive",
    tagline: "Let the project rest without losing what you learned.",
    bestWhen: "Best when the idea no longer fits your priorities.",
    steps: ["Record lessons learned.", "Preserve useful assets.", "Close the project intentionally."],
    color: "#FF9DB5",
    icon: "archive",
  },
];

export const PATH_BY_ID: Record<PathId, RelaunchPath> = Object.fromEntries(
  RELAUNCH_PATHS.map((p) => [p.id, p]),
) as Record<PathId, RelaunchPath>;
