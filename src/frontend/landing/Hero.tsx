import { Sparkles } from 'lucide-react';
import { PixelButton } from '@/frontend/ui/PixelButton';
import { pixelOutline } from '@/frontend/ui/pixelText';

export function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ maxWidth: 'min(54vw, 760px)', padding: '0 24px 0 48px' }}>
      <div style={{ position: 'relative' }}>
        <Sparkles
          size={28}
          style={{ position: 'absolute', top: -18, left: 300, color: 'var(--color-gold)', transform: 'rotate(12deg)' }}
        />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(56px, 5.75vw, 110px)',
            lineHeight: 0.92,
            letterSpacing: 2,
            color: 'var(--color-text-primary)',
            textShadow: pixelOutline('var(--color-stone-outline)', 2, 6),
            margin: 0,
          }}
        >
          YOUR IDEAS
          <br />
          AREN&rsquo;T{' '}
          <span
            style={{
              color: 'var(--color-lavender-bright)',
              textShadow: pixelOutline('var(--color-stone-outline)', 2, 6),
            }}
          >
            DEAD.
          </span>
        </h1>
      </div>
      <p
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          lineHeight: 1.45,
          fontSize: 'clamp(20px, 1.35vw, 26px)',
          color: 'var(--color-text-primary)',
          background: 'rgba(30, 28, 72, 0.88)',
          padding: '12px 20px 14px',
          margin: '22px 4px 0',
          boxShadow: '-4px 0 0 0 var(--color-lavender), 4px 0 0 0 var(--color-lavender), 0 -4px 0 0 var(--color-lavender), 0 4px 0 0 var(--color-lavender), 0 8px 0 0 #14123a',
        }}
      >
        They&rsquo;re just waiting for their
        <br />
        next chapter.
      </p>
      <div style={{ marginTop: 28 }}>
        <PixelButton variant="gold" size="lg" onClick={onEnter} style={{ fontSize: 'clamp(24px, 1.6vw, 30px)', letterSpacing: 2, padding: '0.7em 1.4em' }}>
          ENTER THE GRAVEYARD →
        </PixelButton>
      </div>
    </div>
  );
}
