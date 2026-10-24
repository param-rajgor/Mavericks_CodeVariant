import { Sparkles } from 'lucide-react';
import { PixelButton } from '../nav/PixelButton';
import { pixelOutline } from '../../lib/pixelText';

export function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ maxWidth: 640, padding: '0 24px 0 48px' }}>
      <div style={{ position: 'relative' }}>
        <Sparkles
          size={28}
          style={{ position: 'absolute', top: -18, left: 300, color: 'var(--color-gold)', transform: 'rotate(12deg)' }}
        />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.08,
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
          fontFamily: 'var(--font-mono)',
          fontSize: 24,
          color: 'var(--color-text-primary)',
          textShadow: pixelOutline('rgba(30,28,72,0.85)', 1, 2),
          marginTop: 16,
        }}
      >
        They&rsquo;re just waiting for their
        <br />
        next chapter.
      </p>
      <div style={{ marginTop: 28 }}>
        <PixelButton variant="gold" onClick={onEnter}>
          ENTER THE GRAVEYARD →
        </PixelButton>
      </div>
    </div>
  );
}
