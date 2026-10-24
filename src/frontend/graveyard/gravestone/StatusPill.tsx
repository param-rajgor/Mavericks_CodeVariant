import type { StoneStatus as ProjectStatus } from '@/frontend/graveyard/stone';

const STATUS_STYLES: Record<ProjectStatus, { fill: string; border: string; text: string }> = {
  Stalled: { fill: 'var(--status-stalled-fill)', border: 'var(--status-stalled-border)', text: 'var(--status-stalled-text)' },
  'In Progress': { fill: 'var(--status-in-progress-fill)', border: 'var(--status-in-progress-border)', text: 'var(--status-in-progress-text)' },
  'To Revisit': { fill: 'var(--status-to-revisit-fill)', border: 'var(--status-to-revisit-border)', text: 'var(--status-to-revisit-text)' },
  Archived: { fill: 'var(--status-archived-fill)', border: 'var(--status-archived-border)', text: 'var(--status-archived-text)' },
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  const v = STATUS_STYLES[status];
  return (
    <span
      className="notched"
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-ui)',
        fontWeight: 800,
        fontSize: 15,
        lineHeight: 1,
        padding: '6px 12px',
        background: v.fill,
        border: `2px solid ${v.border}`,
        color: v.text,
      }}
    >
      {status}
    </span>
  );
}
