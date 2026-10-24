import { useMemo } from 'react';

/** Horizon colours, top to bottom, drawn as hard pixel bands. */
const SKY = ['#17183e', '#1b1c4a', '#20215a', '#272468', '#302a77', '#3d2f84', '#4d3792', '#62409c', '#7a4aa3', '#93559f', '#ad629d', '#c47399'];

const CLOUDS: Array<[number, number, number]> = [
  [150, 150, 1],
  [760, 100, 1.3],
  [1010, 210, 0.9],
  [380, 300, 0.8],
];

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#a65da8" opacity="0.75">
      <rect x="20" y="0" width="80" height="12" />
      <rect x="0" y="12" width="160" height="12" />
      <rect x="40" y="-12" width="40" height="12" />
      <rect x="20" y="24" width="100" height="8" opacity="0.6" />
    </g>
  );
}

/** Fixed night-time pixel landscape that sits behind every page of the app. */
export function Scenery({ sun = true }: { sun?: boolean }) {
  const stars = useMemo(() => {
    const out: Array<[number, number, number]> = [];
    let a = 7;
    const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) out.push([Math.floor(r() * 1200), Math.floor(r() * 330), r() < 0.2 ? 6 : 3]);
    return out;
  }, []);
  const dots = 'radial-gradient(circle at 50% 50%, rgba(120,110,190,.55) 0 3px, transparent 3.5px)';
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
        {SKY.map((c, i) => (
          <rect key={c} x="0" y={i * 46} width="1200" height="47" fill={c} />
        ))}
        {stars.map(([x, y, s], i) => (
          <rect key={i} x={x} y={y} width={s} height={s} fill="#fff1d2" opacity={s > 3 ? 0.9 : 0.5} className={i % 4 === 0 ? 'twinkle' : undefined} />
        ))}
        {CLOUDS.map(([x, y, s], i) => (
          <Cloud key={i} x={x} y={y} s={s} />
        ))}
        {sun && (
          <g>
            <rect x="840" y="400" width="240" height="40" fill="#f6b94d" opacity="0.9" />
            <rect x="810" y="440" width="300" height="40" fill="#f6b94d" opacity="0.9" />
            <rect x="780" y="480" width="360" height="44" fill="#f4a35a" opacity="0.9" />
            <rect x="880" y="360" width="160" height="40" fill="#f6b94d" opacity="0.9" />
          </g>
        )}
        {/* distant castle silhouette */}
        <g fill="#2a2766" opacity="0.85">
          <rect x="1010" y="360" width="30" height="170" />
          <rect x="1000" y="340" width="12" height="30" />
          <rect x="1040" y="400" width="70" height="130" />
          <rect x="1110" y="330" width="26" height="200" />
          <rect x="1136" y="410" width="64" height="120" />
          <rect x="1118" y="300" width="10" height="30" />
          <rect x="960" y="440" width="50" height="90" />
        </g>
        {/* hills */}
        <path d="M0 540h1200v260H0z" fill="#232b4d" />
        <path d="M0 540h120v-24h140v24h160v-16h200v16h260v-30h140v30h180v-14h-0v280H0z" fill="#23304f" />
      </svg>
      {/* meadow with its dotted texture */}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[#22403f]" style={{ backgroundImage: dots, backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, transparent, #000 25%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: 'linear-gradient(to bottom, rgba(34,64,63,0), #1d3a3c 70%)' }} />
    </div>
  );
}
