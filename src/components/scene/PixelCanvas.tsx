import { useEffect, useRef, type CSSProperties } from 'react';
import { ART_W, ART_H } from './stage';
import type { SceneVariant } from './draw';

/** One art layer: drawn once at 384×216 and upscaled with pixelated rendering, so
 * every layer shares the same pixel size. */
export function PixelCanvas({
  draw,
  variant,
  style,
}: {
  draw: (c: CanvasRenderingContext2D, v: SceneVariant) => void;
  variant: SceneVariant;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ART_W, ART_H);
    draw(ctx, variant);
  }, [draw, variant]);

  return (
    <canvas
      ref={ref}
      width={ART_W}
      height={ART_H}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated', ...style }}
    />
  );
}
