import { useMemo } from "react";
import { Starfield } from "./PixelBackground";

/**
 * Handcrafted pixel-art landscape background:
 * - Deep twilight sky with twinkling stars
 * - Glowing golden setting sun on the horizon
 * - Layered purple mountains
 * - Majestic pink cherry-blossom tree with warm hanging lanterns and wooden rocket sign
 * - Grassy green meadow in the foreground
 *
 * 100% clean vector pixel art with ZERO baked-in text or duplicate buttons.
 */
export function PixelLandscapeBackground() {
  // Generate random petals drifting in the breeze
  const petals = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: 60 + Math.random() * 38,
      y: 15 + Math.random() * 70,
      size: Math.random() > 0.5 ? 4 : 3,
      delay: Math.random() * 8,
      duration: 7 + Math.random() * 6,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#100E2B]"
    >
      {/* 1. Twinkling stars in the upper sky */}
      <Starfield count={50} maxY={50} seed={23} />

      {/* 2. Responsive Pixel Art Landscape SVG */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Twilight Sky Gradient */}
          <linearGradient id="twilight-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#100E2B" />
            <stop offset="25%" stopColor="#1B1548" />
            <stop offset="50%" stopColor="#2D1A5C" />
            <stop offset="70%" stopColor="#4A276E" />
            <stop offset="85%" stopColor="#6D3279" />
            <stop offset="100%" stopColor="#8C427B" />
          </linearGradient>

          {/* Golden Sunset Glow */}
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4D0" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFC857" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#FF9B66" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6D3279" stopOpacity="0" />
          </radialGradient>

          {/* Lantern Warm Light Glow */}
          <radialGradient id="lantern-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFECA8" stopOpacity="1" />
            <stop offset="45%" stopColor="#FFC857" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#FF9B66" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF9B66" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect width="1440" height="900" fill="url(#twilight-sky)" />

        {/* Distant Clouds / Atmospheric Mist */}
        <g opacity="0.45">
          <rect x="0" y="440" width="1440" height="24" fill="#6A3B85" />
          <rect x="0" y="480" width="1440" height="32" fill="#7E478F" />
          <rect x="0" y="520" width="1440" height="40" fill="#935398" />
        </g>

        {/* Golden Setting Sun (positioned right-of-center near horizon) */}
        <g transform="translate(860, 410)">
          {/* Outer Sun Halos */}
          <circle cx="0" cy="0" r="160" fill="url(#sun-glow)" />
          <circle cx="0" cy="0" r="105" fill="#FFC857" opacity="0.3" />
          <circle cx="0" cy="0" r="85" fill="#FFC857" opacity="0.6" />
          {/* Stepped Pixel Sun Disc */}
          <rect x="-65" y="-65" width="130" height="130" rx="65" fill="#FFEAA0" />
          <rect x="-55" y="-55" width="110" height="110" rx="55" fill="#FFF4D0" />
        </g>

        {/* Far Mountains (Soft Dusky Violet) */}
        <path
          d="M0,570 L120,530 L240,560 L380,510 L520,550 L680,490 L820,540 L960,480 L1120,530 L1280,500 L1440,540 L1440,900 L0,900 Z"
          fill="#3B2664"
        />

        {/* Mid Mountains (Deep Purple) */}
        <path
          d="M0,610 L160,570 L300,600 L440,550 L600,590 L760,530 L920,580 L1080,540 L1240,580 L1440,560 L1440,900 L0,900 Z"
          fill="#2A194C"
        />

        {/* Near Mountains & Castle Silhouette in the Distance */}
        <path
          d="M0,650 L200,620 L380,640 L560,600 L720,630 L880,590 L1040,630 L1200,610 L1440,640 L1440,900 L0,900 Z"
          fill="#1E1138"
        />

        {/* Castle Spire in distance (matching video 00:11) */}
        <g transform="translate(870, 555)" fill="#180C2E">
          <rect x="0" y="0" width="18" height="35" />
          <rect x="-4" y="-8" width="26" height="8" />
          <rect x="4" y="-22" width="10" height="14" />
          <rect x="7" y="-30" width="4" height="8" />
          {/* Battlements */}
          <rect x="-3" y="-12" width="4" height="4" />
          <rect x="7" y="-12" width="4" height="4" />
          <rect x="17" y="-12" width="4" height="4" />
        </g>

        {/* Foreground Meadow Base (Dark Green) */}
        <path
          d="M0,690 Q360,660 720,680 T1440,670 L1440,900 L0,900 Z"
          fill="#25461E"
        />

        {/* Middle Meadow Layer (Vibrant Grass Green) */}
        <path
          d="M0,720 Q400,695 800,710 T1440,705 L1440,900 L0,900 Z"
          fill="#396B2B"
        />

        {/* Foreground Lush Grass Layer (Bright Stepped Lawn) */}
        <path
          d="M0,750 Q380,735 760,745 T1440,740 L1440,900 L0,900 Z"
          fill="#4F8741"
        />

        {/* Stepped Pixel Grass Tufts & Wildflowers across the field */}
        <g fill="#7DBD65">
          {/* Grass blades */}
          <rect x="45" y="742" width="4" height="12" />
          <rect x="52" y="738" width="4" height="16" />
          <rect x="140" y="732" width="4" height="14" />
          <rect x="220" y="744" width="4" height="10" />
          <rect x="340" y="736" width="4" height="14" />
          <rect x="430" y="740" width="4" height="12" />
          <rect x="540" y="738" width="4" height="15" />
          <rect x="670" y="742" width="4" height="11" />
          <rect x="780" y="736" width="4" height="14" />
          <rect x="890" y="740" width="4" height="12" />
          <rect x="1010" y="738" width="4" height="15" />
          <rect x="1140" y="744" width="4" height="10" />
          <rect x="1260" y="736" width="4" height="14" />
          <rect x="1380" y="740" width="4" height="12" />
        </g>

        {/* Tiny Meadow Daisies (White petals with gold center) */}
        {[
          [80, 755], [160, 770], [290, 762], [410, 775],
          [620, 765], [740, 778], [860, 768], [990, 772],
          [1120, 760], [1280, 775], [1390, 765]
        ].map(([fx, fy], idx) => (
          <g key={idx} transform={`translate(${fx}, ${fy})`}>
            {/* White petals */}
            <rect x="-3" y="-3" width="7" height="7" fill="#FFF9F2" />
            {/* Golden center */}
            <rect x="-1" y="-1" width="3" height="3" fill="#FFC857" />
          </g>
        ))}

        {/* ======================================================== */}
        {/* CHERRY BLOSSOM TREE (ON THE RIGHT SIDE)                  */}
        {/* ======================================================== */}
        <g id="cherry-blossom-tree">
          {/* Tree Trunk & Major Branches (Dark Pixel Wood) */}
          <g fill="#2D1C17">
            {/* Trunk Base firmly rooted in right grass */}
            <rect x="1270" y="440" width="80" height="360" rx="10" />
            <rect x="1250" y="660" width="45" height="140" />
            <rect x="1310" y="690" width="60" height="110" />
            {/* Main Arching Trunk */}
            <path
              d="M1270,750 C1280,620 1260,500 1230,420 C1200,340 1150,280 1100,240 L1150,220 C1220,270 1280,340 1310,430 C1340,520 1350,650 1350,750 Z"
            />
            {/* Large Branch extending left towards center */}
            <path
              d="M1210,380 C1140,360 1050,370 960,340 C910,320 860,290 820,260 L830,240 C880,270 930,300 980,315 C1060,335 1150,330 1220,350 Z"
            />
            {/* Branch reaching upper canopy */}
            <path
              d="M1150,300 C1100,230 1020,180 940,150 L955,130 C1040,165 1130,215 1175,285 Z"
            />
            {/* Branch reaching right */}
            <path
              d="M1290,390 C1340,350 1400,320 1440,300 L1440,325 C1390,345 1340,375 1300,410 Z"
            />
          </g>

          {/* Trunk Shading & Wood Texture Details */}
          <g fill="#432820">
            <rect x="1285" y="480" width="12" height="120" />
            <rect x="1305" y="520" width="8" height="90" />
            <rect x="1260" y="600" width="10" height="70" />
          </g>

          {/* Billowing Pink Blossom Foliage Clusters */}
          {/* Base Deep Pink / Plum Shadows */}
          <g fill="#A44A8E">
            <circle cx="820" cy="220" r="85" />
            <circle cx="940" cy="180" r="105" />
            <circle cx="1060" cy="160" r="115" />
            <circle cx="1190" cy="170" r="120" />
            <circle cx="1320" cy="190" r="110" />
            <circle cx="1410" cy="220" r="95" />
            <circle cx="890" cy="280" r="75" />
            <circle cx="1030" cy="260" r="90" />
            <circle cx="1160" cy="270" r="95" />
            <circle cx="1280" cy="280" r="85" />
          </g>

          {/* Mid Pink Petal Clouds */}
          <g fill="#E07AC8">
            <circle cx="810" cy="200" r="75" />
            <circle cx="930" cy="160" r="95" />
            <circle cx="1050" cy="140" r="105" />
            <circle cx="1180" cy="150" r="110" />
            <circle cx="1310" cy="170" r="100" />
            <circle cx="1400" cy="200" r="85" />
            <circle cx="880" cy="260" r="65" />
            <circle cx="1020" cy="240" r="80" />
            <circle cx="1150" cy="250" r="85" />
          </g>

          {/* Bright Sakura Blossom Highlights (Soft Pink & White) */}
          <g fill="#F5A8E2">
            <circle cx="800" cy="180" r="60" />
            <circle cx="915" cy="140" r="75" />
            <circle cx="1035" cy="120" r="85" />
            <circle cx="1165" cy="130" r="90" />
            <circle cx="1295" cy="150" r="80" />
            <circle cx="1385" cy="180" r="65" />
            <circle cx="990" cy="210" r="60" />
            <circle cx="1110" cy="220" r="65" />
          </g>

          {/* Crisp Blossom Puff Highlights (Cream White) */}
          <g fill="#FFF0FA">
            <circle cx="790" cy="165" r="35" />
            <circle cx="900" cy="125" r="45" />
            <circle cx="1020" cy="105" r="55" />
            <circle cx="1145" cy="115" r="60" />
            <circle cx="1275" cy="135" r="50" />
          </g>

          {/* ====================================================== */}
          {/* TWO WARM HANGING LANTERNS                              */}
          {/* ====================================================== */}
          {/* Lantern 1 (Hanging from left branch at x: 960, y: 340) */}
          <g transform="translate(960, 335)">
            {/* Hanging Chain */}
            <rect x="-1" y="0" width="2" height="40" fill="#17183E" />
            {/* Lantern Glow Aura */}
            <circle cx="0" cy="55" r="65" fill="url(#lantern-light)" />
            {/* Lantern Cap */}
            <rect x="-14" y="38" width="28" height="6" fill="#2D1C17" />
            <rect x="-10" y="34" width="20" height="4" fill="#2D1C17" />
            {/* Lantern Glowing Amber Body */}
            <rect x="-11" y="44" width="22" height="24" fill="#FFC857" />
            <rect x="-8" y="47" width="16" height="18" fill="#FFF4D0" />
            {/* Outer Frame & Grid */}
            <rect x="-12" y="44" width="3" height="24" fill="#17183E" />
            <rect x="9" y="44" width="3" height="24" fill="#17183E" />
            <rect x="-1" y="44" width="2" height="24" fill="#17183E" />
            <rect x="-11" y="55" width="22" height="2" fill="#17183E" />
            {/* Bottom Cap */}
            <rect x="-13" y="68" width="26" height="5" fill="#2D1C17" />
            <rect x="-4" y="73" width="8" height="6" fill="#FFAB83" />
          </g>

          {/* Lantern 2 (Hanging from middle branch at x: 1140, y: 380) */}
          <g transform="translate(1140, 375)">
            {/* Hanging Chain */}
            <rect x="-1" y="0" width="2" height="45" fill="#17183E" />
            {/* Lantern Glow Aura */}
            <circle cx="0" cy="60" r="70" fill="url(#lantern-light)" />
            {/* Lantern Cap */}
            <rect x="-14" y="43" width="28" height="6" fill="#2D1C17" />
            <rect x="-10" y="39" width="20" height="4" fill="#2D1C17" />
            {/* Glowing Amber Body */}
            <rect x="-11" y="49" width="22" height="24" fill="#FFC857" />
            <rect x="-8" y="52" width="16" height="18" fill="#FFF4D0" />
            {/* Frame & Grille */}
            <rect x="-12" y="49" width="3" height="24" fill="#17183E" />
            <rect x="9" y="49" width="3" height="24" fill="#17183E" />
            <rect x="-1" y="49" width="2" height="24" fill="#17183E" />
            <rect x="-11" y="60" width="22" height="2" fill="#17183E" />
            {/* Bottom Cap */}
            <rect x="-13" y="73" width="26" height="5" fill="#2D1C17" />
            <rect x="-4" y="78" width="8" height="6" fill="#FFAB83" />
          </g>

          {/* ====================================================== */}
          {/* WOODEN SIGNPOST UNDER THE TREE (WITH ROCKET SYMBOL)    */}
          {/* ====================================================== */}
          <g transform="translate(1210, 470)">
            {/* Post */}
            <rect x="22" y="30" width="12" height="190" fill="#3E2723" />
            <rect x="25" y="30" width="6" height="190" fill="#5D4037" />
            {/* Wooden Signboard */}
            <rect x="-25" y="0" width="105" height="55" rx="3" fill="#4E342E" stroke="#17183E" strokeWidth="3" />
            <rect x="-21" y="4" width="97" height="47" fill="#6D4C41" />
            {/* Subtle wood grains */}
            <rect x="-16" y="16" width="85" height="2" fill="#5D4037" />
            <rect x="-16" y="34" width="85" height="2" fill="#5D4037" />
            {/* Pixel Rocket carved into the sign */}
            <g transform="translate(24, 12)" fill="#FFF1D2">
              <rect x="6" y="2" width="3" height="2" />
              <rect x="5" y="4" width="5" height="15" />
              <rect x="2" y="14" width="3" height="6" />
              <rect x="10" y="14" width="3" height="6" />
              <rect x="6" y="19" width="3" height="4" fill="#FFC857" />
              {/* Window */}
              <rect x="6" y="8" width="3" height="3" fill="#5543A5" />
            </g>
          </g>
        </g>
      </svg>

      {/* 3. Floating Drifting Blossom Petals */}
      <div className="absolute inset-0 pointer-events-none">
        {petals.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-sm bg-[#F5A8E2] opacity-75"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: "0 0 2px #FFBEEF",
              animation: `drift-petal ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes drift-petal {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translate(-140px, 180px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
