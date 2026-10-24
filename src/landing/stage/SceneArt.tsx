import { useMemo } from "react";
import { CAT_ROCK, CHERRY_LILAC, LANTERN, ROCKET, SIGNPOST, SpriteG } from "@/src/ui/pixel";

/**
 * The landing scenery, drawn entirely from code in a 1586x992 coordinate space: banded sunset sky,
 * pixel sun, clouds, stepped mountains, forest, meadow, the cherry tree with lanterns, the signpost,
 * the sleeping cat and foreground leaves. Everything is vector or sprite grids; there is no image file.
 */
export const SCENE_W = 1586;
export const SCENE_H = 992;

const SKY = [
  "#262466", "#2b2872", "#312c7e", "#38308a", "#403498", "#4a3aa4", "#5642ae", "#6649b6",
  "#7a52bb", "#905dc0", "#a96ac2", "#c37cbf", "#dc90b4", "#ee9f9c", "#f6ad8a",
];

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
}

/** A stepped ridge line as one filled path, `step` px per column. */
function ridge(seed: number, base: number, amp: number, step: number, from = -900, to = SCENE_W + 900, bottom = 900) {
  const r = rng(seed);
  let d = `M${from} ${bottom}`;
  let h = base;
  for (let x = from; x < to; x += step) {
    h = base - amp * (0.5 + 0.5 * Math.sin(x / 190 + seed) * Math.cos(x / 97 + seed * 2)) - r() * amp * 0.25;
    h = Math.round(h / 6) * 6;
    d += `V${h}H${x + step}`;
  }
  return `${d}V${bottom}z`;
}

function Cloud({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <rect x="28" y="0" width="84" height="14" />
      <rect x="0" y="14" width="190" height="14" />
      <rect x="56" y="-14" width="42" height="14" />
      <rect x="120" y="-7" width="42" height="7" />
      <rect x="14" y="28" width="150" height="7" opacity="0.55" />
    </g>
  );
}

function Bush({ x, y, s = 1, dark = "#1c4337", light = "#2f6a45" }: { x: number; y: number; s?: number; dark?: string; light?: string }) {
  const r = useMemo(() => rng(Math.round(x + y)), [x, y]);
  const leaves = useMemo(() => Array.from({ length: 26 }, () => ({ x: (r() - 0.5) * 220, y: -r() * 150, w: 18 + r() * 30, c: r() < 0.5 })), [r]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {leaves.map((l, i) => (
        <g key={i}>
          <rect x={l.x} y={l.y} width={l.w} height="14" fill={l.c ? dark : light} />
          <rect x={l.x + 6} y={l.y - 8} width={l.w - 12} height="8" fill={l.c ? dark : light} />
        </g>
      ))}
      <rect x="-110" y="-30" width="220" height="60" fill={dark} />
    </g>
  );
}

function Flower({ x, y, c = "#fff7ec" }: { x: number; y: number; c?: string }) {
  return (
    <g>
      <rect x={x - 8} y={y - 4} width="8" height="8" fill={c} />
      <rect x={x + 8} y={y - 4} width="8" height="8" fill={c} />
      <rect x={x} y={y - 12} width="8" height="8" fill={c} />
      <rect x={x} y={y + 4} width="8" height="8" fill={c} />
      <rect x={x} y={y - 4} width="8" height="8" fill="#ffc857" />
      <rect x={x + 2} y={y + 12} width="4" height="22" fill="#3f7a3a" />
    </g>
  );
}

export function SceneArt() {
  const stars = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 70 }, () => ({ x: -700 + r() * 3000, y: r() * 360, s: r() < 0.2 ? 6 : 4 }));
  }, []);
  const tufts = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 130 }, () => ({ x: -500 + r() * 2600, y: 770 + r() * 230, h: 8 + r() * 14, c: r() < 0.5 ? "#8fc86a" : "#3f7a3a" }));
  }, []);
  const sparkles = [[1197, 482], [964, 552], [1273, 566], [1505, 496], [1150, 515], [740, 600], [425, 698]];

  return (
    <g>
      {/* sky, as hard bands that carry on past both sides */}
      {SKY.map((c, i) => (
        <rect key={c} x="-900" y={i * 50} width={SCENE_W + 1800} height="51" fill={c} />
      ))}
      {stars.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} fill="#fff4d6" opacity={0.35 + (i % 4) * 0.15} className={i % 5 === 0 ? "twinkle" : undefined} />
      ))}
      {sparkles.map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 10}h4v6h6v4h-6v6h-4v-6h-6v-4h6z`} fill="#ffd36a" opacity="0.9" />
      ))}

      <Cloud x={930} y={168} s={1.2} color="#9f7be0" />
      <Cloud x={730} y={236} s={1.15} color="#c383d6" />
      <Cloud x={860} y={338} s={0.75} color="#b06fc9" />
      <Cloud x={520} y={330} s={0.7} color="#a375d4" />
      <Cloud x={70} y={560} s={0.9} color="#c78ec0" />

      {/* sun */}
      <g shapeRendering="crispEdges">
        <rect x="900" y="372" width="180" height="26" fill="#ffd27a" />
        <rect x="868" y="398" width="244" height="26" fill="#ffc46a" />
        <rect x="846" y="424" width="288" height="30" fill="#ffb867" />
        <rect x="830" y="454" width="320" height="34" fill="#fbaa66" opacity="0.95" />
      </g>

      {/* mountains */}
      <path d={ridge(3, 560, 150, 24, -900, SCENE_W + 900, 800)} fill="#5a44b4" />
      <path d={ridge(11, 600, 100, 20, -900, SCENE_W + 900, 800)} fill="#45379a" />
      <path d={ridge(17, 640, 70, 18, -900, SCENE_W + 900, 800)} fill="#34308a" />
      {/* distant forest and rolling hills */}
      <path d={ridge(23, 690, 40, 14, -900, SCENE_W + 900, 820)} fill="#27487c" />
      <path d={ridge(29, 730, 34, 14, -900, SCENE_W + 900, 840)} fill="#24566a" />
      <path d={ridge(31, 760, 22, 12, -900, SCENE_W + 900, 860)} fill="#3f7a4c" />

      {/* meadow */}
      <rect x="-900" y="768" width={SCENE_W + 1800} height="60" fill="#6aa84f" />
      <rect x="-900" y="828" width={SCENE_W + 1800} height="70" fill="#5a9645" />
      <rect x="-900" y="898" width={SCENE_W + 1800} height="140" fill="#4a823d" />
      {tufts.map((t, i) => (
        <g key={i} fill={t.c}>
          <rect x={t.x} y={t.y - t.h} width="4" height={t.h} />
          <rect x={t.x + 8} y={t.y - t.h * 0.6} width="4" height={t.h * 0.6} />
          <rect x={t.x - 8} y={t.y - t.h * 0.7} width="4" height={t.h * 0.7} />
        </g>
      ))}

      {/* the cherry tree, its branch and hanging lanterns */}
      <rect x="1490" y="548" width="110" height="250" fill="#5f3a26" />
      <rect x="1490" y="548" width="34" height="250" fill="#7a4d34" />
      <rect x="1584" y="548" width="16" height="250" fill="#3c2a52" />
      <rect x="1450" y="772" width="60" height="26" fill="#5f3a26" />
      <SpriteG sprite={CHERRY_LILAC} x={1190} y={20} width={640} />
      <g fill="#6b4230">
        <rect x="1120" y="318" width="60" height="22" />
        <rect x="1170" y="326" width="70" height="22" />
        <rect x="1230" y="334" width="80" height="24" />
        <rect x="1300" y="344" width="90" height="26" />
        <rect x="1380" y="360" width="70" height="30" />
        <rect x="1440" y="380" width="60" height="40" />
      </g>
      <g stroke="#3c2a52" strokeWidth="3">
        <line x1="1238" y1="350" x2="1238" y2="372" />
        <line x1="1337" y1="368" x2="1337" y2="392" />
      </g>
      <SpriteG sprite={LANTERN} x={1214} y={372} width={50} />
      <SpriteG sprite={LANTERN} x={1313} y={392} width={50} />
      <ellipse cx="1239" cy="404" rx="46" ry="46" fill="#ffd27a" opacity="0.18" />
      <ellipse cx="1338" cy="424" rx="46" ry="46" fill="#ffd27a" opacity="0.18" />

      {/* signpost with the rocket */}
      <rect x="1409" y="560" width="22" height="238" fill="#6d4527" />
      <rect x="1409" y="560" width="8" height="238" fill="#8d5a33" />
      <SpriteG sprite={SIGNPOST} x={1343} y={456} width={160} />
      <SpriteG sprite={ROCKET} x={1390} y={470} width={62} />

      {/* cat on its rock */}
      <SpriteG sprite={CAT_ROCK} x={70} y={640} width={330} flip />
      <g fill="#fff4ea" fontFamily="'Press Start 2P', monospace" fontSize="22">
        <text x="300" y="650">Z</text>
        <text x="326" y="622" fontSize="26">Z</text>
        <text x="350" y="588" fontSize="30">Z</text>
      </g>
      <g fill="#7a65b8">
        <rect x="1440" y="800" width="180" height="70" />
        <rect x="1470" y="778" width="120" height="28" />
      </g>
      <g fill="#9784d4">
        <rect x="1470" y="778" width="120" height="8" />
      </g>

      <Flower x={450} y={742} />
      <Flower x={974} y={774} />
      <Flower x={1260} y={786} />
      <Flower x={520} y={760} c="#ffc857" />

      {/* foreground leaves */}
      <Bush x={40} y={950} s={1.5} />
      <Bush x={170} y={990} s={1.1} dark="#16382f" light="#275a3c" />
      <Bush x={1540} y={940} s={1.5} />
      <Bush x={1400} y={992} s={1} dark="#16382f" light="#275a3c" />
    </g>
  );
}
