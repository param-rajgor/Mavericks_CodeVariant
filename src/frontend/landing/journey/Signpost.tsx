import { useEffect, useMemo, useState, type CSSProperties } from 'react';

const PAD_X = 12;
const PAD_Y = 8;
const BORDER = 3;
const MIN_W = 120;
const LINE_H = 1.15;
const TRACK = 1; // letter-spacing, px
/** Extra room so the text never touches the border, even with rounding. */
const SAFETY = 4;
const CHROME = 2 * (PAD_X + BORDER) + SAFETY;

/** At most two lines, broken only at the last space: "Technical difficulty" → "Technical" / "difficulty". */
export function signLines(label: string, wrap: boolean): string[] {
  const at = label.lastIndexOf(' ');
  return wrap && at > 0 ? [label.slice(0, at), label.slice(at + 1)] : [label];
}

let ctx: CanvasRenderingContext2D | null = null;
/** Width of one line at 100px, without letter-spacing. */
function width100(text: string) {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * 50;
  ctx.font = '100px "Jersey 15"';
  return ctx.measureText(text).width;
}

/** Bumps when web fonts finish loading, so measurements use Jersey 15 and not its fallback. */
function useFontsLoaded() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    const bump = () => live && setN((k) => k + 1);
    document.fonts.ready.then(bump);
    document.fonts.addEventListener('loadingdone', bump);
    return () => {
      live = false;
      document.fonts.removeEventListener('loadingdone', bump);
    };
  }, []);
  return n;
}

/**
 * One font size for a whole group of signs: `preferred`, or smaller if the longest line would not fit the
 * widest board the group has room for, so every sign in the group shrinks together. Each board is then
 * just wide enough for its own text (never under 120px).
 */
export function useSignGroup(labels: string[][], preferred: number, maxBoard: number) {
  const fonts = useFontsLoaded();
  const key = labels.map((l) => l.join('\n')).join('\t');
  return useMemo(() => {
    const lines = labels.flat();
    const fits = Math.min(...lines.map((l) => ((maxBoard - CHROME - l.length * TRACK) * 100) / width100(l)));
    const fontSize = Math.max(1, Math.floor(Math.min(preferred, fits)));
    const lineW = (l: string) => (width100(l) * fontSize) / 100 + l.length * TRACK;
    const widths = labels.map((ls) => Math.ceil(Math.min(maxBoard, Math.max(MIN_W, Math.max(...ls.map(lineW)) + CHROME))));
    const height = Math.ceil(Math.max(...labels.map((ls) => ls.length)) * fontSize * LINE_H + 2 * (PAD_Y + BORDER));
    return { fontSize, widths, height };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, preferred, maxBoard, fonts]);
}

interface SignpostProps {
  lines: string[];
  fontSize: number;
  /** Board width and height in px (from useSignGroup, so the group matches). */
  width: number;
  height: number;
  /** Centre of the post and top of the board, in px inside the panel. */
  x: number;
  y: number;
  /** The post under the board, in px. Left out when the scene draws the post. */
  pole?: { width: number; height: number };
  /** A coloured strip along the top of the board. */
  accent?: string;
  boardStyle?: CSSProperties;
}

/** A wooden sign on a post. The text is centred both ways and always sits inside the board. */
export function Signpost({ lines, fontSize, width, height, x, y, pole, accent, boardStyle }: SignpostProps) {
  return (
    <div style={{ position: 'absolute', left: x - width / 2, top: y, width }}>
      <div
        style={{
          boxSizing: 'border-box',
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${PAD_Y}px ${PAD_X}px`,
          background: '#C89A63',
          border: `${BORDER}px solid #2E1E18`,
          boxShadow: accent ? `inset 0 4px 0 ${accent}` : undefined,
          color: '#2E1E18',
          fontFamily: 'var(--font-display)',
          fontSize,
          lineHeight: LINE_H,
          letterSpacing: TRACK,
          textAlign: 'center',
          ...boardStyle,
        }}
      >
        {lines.map((l) => (
          <span key={l} style={{ whiteSpace: 'nowrap' }}>
            {l}
          </span>
        ))}
      </div>
      {pole && <div style={{ width: pole.width, height: pole.height, margin: '0 auto', background: '#6B4A3A' }} />}
    </div>
  );
}
