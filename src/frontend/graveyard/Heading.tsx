import { pixelOutline } from '@/frontend/ui/pixelText';

export function Heading() {
  const outline = pixelOutline('var(--color-stone-outline)', 2, 5);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.1,
          color: 'var(--color-text-primary)',
          textShadow: outline,
          margin: 0,
        }}
      >
        YOUR PROJECT
        <br />
        <span style={{ color: 'var(--color-gold)', textShadow: outline }}>&ndash;</span> GRAVEYARD{' '}
        <span style={{ color: 'var(--color-gold)', textShadow: outline }}>&ndash;</span>
      </h1>
      <div
        className="notched"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 24px',
          border: '2px solid var(--color-lavender)',
          background: 'var(--color-panel-indigo)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          maxWidth: 520,
        }}
      >
        <span style={{ width: 8, height: 8, flexShrink: 0, background: 'var(--color-lavender)', transform: 'rotate(45deg)' }} />
        Every little idea gets a place to rest — and a chance to rise again.
        <span style={{ width: 8, height: 8, flexShrink: 0, background: 'var(--color-lavender)', transform: 'rotate(45deg)' }} />
      </div>
    </div>
  );
}
