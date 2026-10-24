import { memo, type CSSProperties } from 'react';
import { BarChart3, Code2, FlaskConical, GraduationCap, Laptop, Package, Sprout, type LucideIcon } from 'lucide-react';
import type { Domain, Project } from '../domain/types';
import { STATUS_UI, ago } from '../domain/insights';
import { Island, Lantern, Tomb } from '../ui/pixel';

const DOMAIN_ICON: Record<Domain, LucideIcon> = {
  Software: Code2,
  Business: Package,
  Research: BarChart3,
  Creative: Laptop,
  Academic: GraduationCap,
  Personal: Sprout,
  Other: FlaskConical,
};

/** A tombstone for one project, standing on its own floating island. Sized by its container (cqw units). */
export const IslandTomb = memo(function IslandTomb({
  project,
  variant = 0,
  onOpen,
  shortAgo = false,
  hint,
  className,
  style,
}: {
  project: Project;
  variant?: number;
  onOpen: (id: string) => void;
  shortAgo?: boolean;
  /** Small caption shown on hover and focus. */
  hint?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ui = STATUS_UI[project.status];
  const Icon = DOMAIN_ICON[project.domain] ?? FlaskConical;
  const when = ago(project, shortAgo);
  return (
    <button
      type="button"
      data-ghost="tomb"
      onClick={() => onOpen(project.id)}
      aria-label={`${project.name}. ${ui.chip}. Last worked ${when}. Open details.`}
      className={`group ${className?.includes('absolute') ? '' : 'relative'} block text-left [container-type:inline-size] ${className ?? ''}`}
      style={style}
    >
      <div className="relative w-full" style={{ aspectRatio: '40 / 26' }}>
        <Island variant={variant} className="absolute inset-0 h-full w-full" />
        <Lantern className="absolute" style={{ left: '7%', bottom: '38%', width: '8%' }} />
        <Lantern className="absolute" style={{ right: '7%', bottom: '38%', width: '8%' }} />
      </div>
      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 transition-transform duration-150 [transition-timing-function:steps(3)] group-hover:-translate-y-[3cqw] group-hover:-translate-x-1/2 group-focus-visible:-translate-y-[3cqw]"
        style={{ bottom: '78%', width: '54%' }}
      >
        <div className="relative w-full drop-shadow-[0_0_0_rgba(0,0,0,0)] group-hover:drop-shadow-[0_0_2.5cqw_rgba(255,214,120,0.75)]" style={{ aspectRatio: '18 / 24' }}>
          <Tomb className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 flex flex-col items-center px-[9%] pb-[7%] pt-[19%] text-center">
            <Icon aria-hidden className="shrink-0 text-[#6a55b4]" style={{ width: '14cqw', height: '14cqw' }} strokeWidth={2.4} />
            <span className="mt-auto font-title font-bold leading-[1.05] text-[#2a2260] [overflow-wrap:break-word]" style={{ fontSize: 'max(10px, 6cqw)' }}>
              {project.name}
            </span>
            <span className="mt-[2.2cqw] rounded-[0.8cqw] border-2 border-[#2a2260] font-extrabold leading-none" style={{ background: ui.bg, color: ui.fg, fontSize: 'max(10px, 4.6cqw)', padding: '1.2cqw 3cqw' }}>
              {ui.chip}
            </span>
            <span className="mt-[2cqw] leading-tight text-[#3d3478]" style={{ fontSize: 'max(10px, 3.8cqw)' }}>
              {shortAgo ? when : <>Last worked<br />{when}</>}
            </span>
          </div>
        </div>
      </div>
      {hint && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-[-14%] z-20 hidden w-max max-w-[80cqw] -translate-x-1/2 -translate-y-full rounded-lg border-[3px] border-night bg-soft px-[3cqw] py-[1.6cqw] text-left shadow-[0_4px_0_#0d0e2b] group-hover:block group-focus-visible:block"
          style={{ fontSize: 'max(11px, 4.4cqw)' }}
        >
          <span className="block font-extrabold text-night">Open details</span>
          <span className="block font-mono text-[0.85em] text-twilight">{hint}</span>
        </span>
      )}
    </button>
  );
});
