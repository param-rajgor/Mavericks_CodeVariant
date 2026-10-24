type VineSize = 'heavy' | 'small';

/** Decorative vine overlay, drawn separately from the stone (spec: "a separate
 * decorative overlay"). Heavy on SocialPulse, small on a couple of others. */
export function Vine({ size }: { size: VineSize }) {
  const leaves =
    size === 'heavy'
      ? [
          { x: 10, y: 10, r: 9 },
          { x: 2, y: 28, r: 8 },
          { x: 14, y: 44, r: 8 },
          { x: 4, y: 62, r: 7 },
          { x: 16, y: 78, r: 6 },
        ]
      : [
          { x: 8, y: 8, r: 7 },
          { x: 2, y: 22, r: 6 },
        ];

  const stemD =
    size === 'heavy' ? 'M20,0 C6,16 18,34 6,50 C-2,64 14,72 10,88' : 'M16,0 C6,10 14,20 6,28';

  return (
    <svg
      width={size === 'heavy' ? 34 : 22}
      height={size === 'heavy' ? 92 : 32}
      viewBox={size === 'heavy' ? '0 0 34 92' : '0 0 22 32'}
      shapeRendering="crispEdges"
      style={{ position: 'absolute', top: -6, left: -10, pointerEvents: 'none' }}
    >
      <path d={stemD} stroke="#4C7A3A" strokeWidth={3} fill="none" />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.r} ry={l.r * 0.65} fill={i % 2 ? '#93C062' : '#76A84F'} stroke="#4C7A3A" strokeWidth={1} />
      ))}
    </svg>
  );
}
