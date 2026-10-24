import { PixelSprite } from '@/frontend/ui/PixelSprite';
import { GHOST_CENTER, GHOST_LEFT, GHOST_RIGHT } from './sprites';

/**
 * The little white protagonist. The scroll handler places it and sets four attributes:
 * data-move (walking), data-face (l | r), data-look (c | l | r) and data-wave. CSS does the rest.
 */
export function Ghost({ px }: { px: number }) {
  const size = 14 * px;
  return (
    <div
      aria-hidden="true"
      data-ghost-actor
      data-move="0"
      data-face="r"
      data-look="c"
      data-wave="0"
      className="journey-ghost"
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 6, pointerEvents: 'none', willChange: 'transform' }}
    >
      <div style={{ position: 'relative', width: size, height: size, transform: 'translate(-50%, -55%)' }}>
        <div className="ghost-aura" style={{ position: 'absolute', inset: '-45%', background: 'radial-gradient(circle, rgba(185,150,255,0.4), transparent 62%)' }} />
        <div className="ghost-body" style={{ position: 'absolute', inset: 0 }}>
          <div className="ghost-flip" style={{ position: 'absolute', inset: 0 }}>
            <span className="g-c" style={{ position: 'absolute', inset: 0 }}>
              <PixelSprite sprite={GHOST_CENTER} px={px} />
            </span>
            <span className="g-l" style={{ position: 'absolute', inset: 0, display: 'none' }}>
              <PixelSprite sprite={GHOST_LEFT} px={px} />
            </span>
            <span className="g-r" style={{ position: 'absolute', inset: 0, display: 'none' }}>
              <PixelSprite sprite={GHOST_RIGHT} px={px} />
            </span>
            <span className="ghost-arm" style={{ position: 'absolute', right: '-5%', top: '44%', width: '17%', height: '24%', background: '#FFF9F2', border: `${Math.max(2, px * 0.5)}px solid #8F6FE8` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
