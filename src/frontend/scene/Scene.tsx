import { memo } from 'react';
import { Stage } from '@/frontend/scene/stage';
import { PixelCanvas } from '@/frontend/scene/PixelCanvas';
import { drawSky, drawClouds, drawLand, drawFrontGrass, drawFrontLeaves, type SceneVariant } from '@/frontend/scene/draw';
import { TwinkleStars, Fireflies, LanternGlows, Petals, Zzz } from '@/frontend/scene/Ambient';

const AMBIENT = {
  landing: {
    stars: [[192, 12], [226, 6], [262, 16], [312, 8], [176, 30], [140, 8], [108, 14], [356, 10]] as [number, number][],
    lanterns: [[300, 81], [324, 81]] as [number, number][],
    petals: [[300, 64], [340, 66], [360, 60]] as [number, number][],
    zzz: [[53, 140], [58, 133], [64, 127]] as [number, number][],
    fireflies: [[120, 150], [176, 122], [238, 140], [290, 112], [352, 150], [205, 98], [96, 120], [330, 128], [260, 160], [150, 164]] as [number, number][],
  },
  dashboard: {
    stars: [[40, 8], [130, 12], [260, 8], [300, 20], [340, 10], [206, 64], [118, 62]] as [number, number][],
    lanterns: [[76, 81], [58, 81], [40, 81]] as [number, number][],
    petals: [[83, 64], [43, 66], [23, 60]] as [number, number][],
    zzz: [[344, 171], [339, 164], [333, 158]] as [number, number][],
    fireflies: [[30, 120], [110, 140], [170, 110], [230, 150], [300, 128], [350, 160], [80, 96], [270, 100]] as [number, number][],
  },
};

/** Back layers 1–8: sky, sun, clouds, mountains, meadow, tree, sign, cat — one
 * coherent, full-width pixel-art world with no crops or seams. Memoised: it must never
 * re-render while something is being dragged over it. */
export const Scene = memo(function Scene({ variant }: { variant: SceneVariant }) {
  const a = AMBIENT[variant];
  return (
    <Stage>
      <PixelCanvas draw={drawSky} variant={variant} />
      <TwinkleStars points={a.stars} />
      <PixelCanvas draw={drawClouds} variant={variant} style={{ animation: 'px-drift 48s ease-in-out infinite' }} />
      <PixelCanvas draw={drawLand} variant={variant} />
      <LanternGlows points={a.lanterns} />
      <Petals points={a.petals} />
      <Zzz points={a.zzz} />
      {variant === 'dashboard' && <Fireflies points={a.fireflies} />}
    </Stage>
  );
});

/** Front layers 10–12, drawn over the stones: grass and flowers at the stone bases,
 * corner leaves, fireflies. */
export function SceneFront() {
  return (
    <Stage>
      <PixelCanvas draw={drawFrontGrass} variant="landing" style={{ animation: 'px-sway 2.4s steps(1, end) infinite' }} />
      <PixelCanvas draw={drawFrontLeaves} variant="landing" />
      <Fireflies points={AMBIENT.landing.fireflies} />
    </Stage>
  );
}
