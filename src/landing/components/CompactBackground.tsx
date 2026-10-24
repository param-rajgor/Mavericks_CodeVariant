import { SceneArt, SCENE_H } from "@/src/landing/stage/SceneArt";

/**
 * Background for narrow windows: the sky, tree and sunset from the scene across the top, fading into
 * the night meadow, so the real headline and tombstones can sit on a clean surface.
 */
export function CompactBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#17183E]">
      <svg className="absolute inset-x-0 top-0 h-[74svh] w-full" viewBox={`760 0 826 ${SCENE_H}`} preserveAspectRatio="xMaxYMin slice" shapeRendering="crispEdges" focusable="false">
        <SceneArt />
      </svg>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(23,24,62,.55) 0, rgba(23,24,62,.15) 14%, rgba(23,24,62,.4) 34%, rgba(23,24,62,.92) 52%, #17183E 60%)" }} />
    </div>
  );
}
