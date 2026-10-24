import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { navigate } from '@/frontend/routing/router';
import { useChrome } from '@/frontend/shell/AppChrome';
import { NavBar } from '@/frontend/navigation/NavBar';
import { PixelButton } from '@/frontend/ui/PixelButton';
import { PixelCanvas } from '@/frontend/scene/PixelCanvas';
import { Fireflies, LanternGlows, Petals, TwinkleStars, Zzz } from '@/frontend/scene/Ambient';
import { ART_H, ART_W, LANDING_STONE_CENTERS, STONE_ROW_X, GROUND_Y, measure, useArtScale } from '@/frontend/scene/stage';
import { drawClouds, drawFrontGrass, drawFrontLeaves, drawLandFront } from '@/frontend/scene/draw';
import { Gravestone } from '@/frontend/graveyard/gravestone/Gravestone';
import type { Stone } from '@/frontend/graveyard/stone';
import { Hero } from '@/frontend/landing/Hero';
import { StatsBar } from '@/frontend/landing/StatsBar';
import { pixelOutline } from '@/frontend/ui/pixelText';
import { drawGroundB, drawGroundC, drawPath, drawSkyDawn, drawSkyTwilight, drawSunDawn, drawSunTwilight, rangeDrawer, CROSS } from './art';
import { Ghost } from './Ghost';
import { CrossroadsProps, GraveyardProps, ReasonPosts, SunriseProps } from './JourneyProps';
import { CAPTIONS, PANEL, PATHS_COPY, WORLD_W, bump, clamp, dawnAt, ghostAt, INTEREST, ramp } from './timeline';

gsap.registerPlugin(ScrollTrigger);

const drawLandA = (c: CanvasRenderingContext2D) => drawLandFront(c, 'landing');
const drawCloudsLanding = (c: CanvasRenderingContext2D) => drawClouds(c, 'landing');
const drawFrontGrassA = (c: CanvasRenderingContext2D) => drawFrontGrass(c);
const drawLeaves = (c: CanvasRenderingContext2D) => drawFrontLeaves(c);
const pathA = drawPath(0);
const pathB = drawPath(1);

/** Mountain ranges: [layer, parallax speed]. Far ranges drift slowly, near ones keep pace with the ground. */
const RANGES = [
  [0, 0.16],
  [1, 0.3],
  [2, 0.48],
] as const;

const STARS: [number, number][] = [[192, 12], [226, 6], [262, 16], [312, 8], [176, 30], [140, 8], [108, 14], [356, 10], [60, 20], [30, 8]];
const LANTERNS_A: [number, number][] = [[300, 81], [324, 81]];
const PETALS_A: [number, number][] = [[300, 64], [340, 66], [360, 60]];
const ZZZ_A: [number, number][] = [[53, 140], [58, 133], [64, 127]];
const FIREFLIES_A: [number, number][] = [[120, 150], [176, 122], [238, 140], [290, 112], [352, 150], [205, 98], [96, 120], [330, 128], [260, 160], [150, 164]];
const FIREFLIES_C: [number, number][] = [[40, 120], [120, 130], [200, 118], [280, 126], [340, 108]];
const PETALS_C: [number, number][] = [[80, 60], [190, 52], [300, 66]];

const CHAPTERS = [
  { p: 0.12, label: 'The forgotten graveyard' },
  { p: 0.52, label: 'The crossroads' },
  { p: 0.97, label: 'The sunrise' },
];

const panelStyle = (i: number) => ({ position: 'absolute' as const, top: 0, left: `${(i * 100) / 3}%`, width: `${100 / 3}%`, height: '100%' });
const fill = { position: 'absolute' as const, inset: 0 };

interface Props {
  stones: Stone[];
  onEnter: (selectId?: string) => void;
}

/**
 * The scroll-driven story. A tall container scrolls; inside it a sticky stage shows a three-panel pixel world
 * (graveyard, crossroads, sunrise). One scroll trigger smooths the scroll position into a single progress value,
 * and `render` turns that value into camera, ghost, light and scene variables. Nothing else moves those things.
 */
export function JourneyLanding({ stones, onEnter }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const art = useArtScale();
  const { openNew } = useChrome();
  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);
  const phone = typeof window !== 'undefined' && window.innerWidth < 700;

  const jump = (p: number) => {
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + p * (el.offsetHeight - window.innerHeight), behavior: 'smooth' });
  };

  const plant = () => {
    navigate('/graveyard');
    window.setTimeout(openNew, 450);
  };

  useLayoutEffect(() => {
    const root = stage.current;
    const worldEl = world.current;
    if (!root || !worldEl) return;
    const par = [...root.querySelectorAll<HTMLElement>('[data-par]')].map((el) => ({ el, f: Number(el.dataset.par) }));
    const timed = [...root.querySelectorAll<HTMLElement>('[data-from]')].map((el) => ({ el, from: Number(el.dataset.from), to: Number(el.dataset.to), fade: Number(el.dataset.fade ?? 0.012) }));
    const dots = [...root.querySelectorAll<HTMLElement>('[data-dot]')];
    const actor = root.querySelector<HTMLElement>('[data-ghost-actor]');
    const set = (k: string, v: string | number) => root.style.setProperty(k, String(v));
    const state = { p: 0 };
    let lastP = 0;

    const render = (p: number) => {
      const { s, left } = measure();
      const vw = window.innerWidth;
      const g = ghostAt(p);
      const camMin = 0;
      const camMax = WORLD_W - (vw - left) / s;
      const camX = clamp(g.x - ((vw < 700 ? 0.3 : 0.4) * vw - left) / s, camMin, camMax);
      worldEl.style.transform = `translate3d(${(-camX * s).toFixed(1)}px,0,0)`;
      for (const l of par) l.el.style.transform = `translate3d(${(-camX * l.f * s).toFixed(1)}px,0,0)`;

      if (actor) {
        const v = ghostAt(Math.min(1, p + 0.004)).x - ghostAt(Math.max(0, p - 0.004)).x;
        const moving = Math.abs(v) > 0.6;
        let look = 0;
        let best = 90;
        for (const x of INTEREST) {
          const d = x - g.x;
          if (Math.abs(d) < best) {
            best = Math.abs(d);
            look = d;
          }
        }
        actor.dataset.move = moving ? '1' : '0';
        actor.dataset.face = moving ? (v > 0 ? 'r' : 'l') : look < -3 ? 'l' : 'r';
        actor.dataset.look = !moving && Math.abs(look) > 4 ? (look > 0 ? 'r' : 'l') : 'c';
        actor.dataset.wave = p > 0.975 ? '1' : '0';
        const hop = moving ? Math.sin(p * 900) * 0.9 : 0;
        actor.style.transform = `translate3d(${(g.x * s).toFixed(1)}px,${((g.y + hop) * s).toFixed(1)}px,0)`;
      }

      const dawn = dawnAt(p);
      set('--dawn', dawn.toFixed(3));
      set('--stars', clamp(1 - dawn * 1.8).toFixed(3));
      set('--sunT', (74 * ramp(p, 0.04, 0.5)).toFixed(2));
      set('--sunD', (92 * (1 - ramp(p, 0.7, 1))).toFixed(2));
      set('--warm', (dawn * 0.34).toFixed(3));
      set('--leaf', (1 - ramp(p, 0.04, 0.18)).toFixed(3));

      // scene one: pieces of work above the stones, sparks on the stone being touched, signposts that light up
      for (let i = 0; i < 6; i++) set(`--art${i}`, (ramp(p, 0.085 + i * 0.025, 0.12 + i * 0.025) * (1 - ramp(p, 0.275, 0.305))).toFixed(3));
      let near = -1;
      LANDING_STONE_CENTERS.forEach((cx, i) => {
        const n = p > 0.06 && p < 0.31 ? clamp(1 - Math.abs(g.x - cx) / 7) : 0;
        if (n > 0.5) near = i;
        set(`--touch${i}`, n.toFixed(3));
      });
      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
      [18, 40, 62, 84].forEach((x, i) => {
        const wx = PANEL + x;
        const n = clamp(1 - Math.abs(g.x - wx) / 16);
        set(`--rs${i}`, Math.max(n, g.x > wx + 6 ? 0.28 : 0).toFixed(3));
      });

      // scene two: the five paths, the crystal and its factors, the fragments
      CROSS.posts.forEach((x, i) => {
        const wx = PANEL + x;
        const n = clamp(1 - Math.abs(g.x - wx) / 20);
        set(`--l${i}`, Math.max(n, p > 0.4 && g.x > wx - 8 ? 0.55 : 0).toFixed(3));
        set(`--pm${i}`, (n * ramp(p, 0.4, 0.425) * (1 - ramp(p, 0.725, 0.75))).toFixed(3));
      });
      set('--rp', ramp(p, 0.595, 0.63).toFixed(3));

      // scene three
      set('--bloom', ramp(p, 0.8, 0.98).toFixed(3));
      set('--lg', (ramp(p, 0.76, 0.86) * (1 - ramp(p, 0.94, 1) * 0.85)).toFixed(3));
      set('--fly', ramp(p, 0.84, 0.93).toFixed(3));

      for (const t of timed) {
        const o = ramp(p, t.from, t.from + t.fade) * (1 - ramp(p, t.to - t.fade, t.to));
        t.el.style.opacity = o.toFixed(3);
        t.el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        t.el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      }
      let on = 0;
      CHAPTERS.forEach((c, i) => {
        if (p >= c.p - 0.14) on = i;
      });
      dots.forEach((d, i) => (d.dataset.on = i === on ? '1' : '0'));
    };

    render(state.p);
    const trigger = ScrollTrigger.create({
      trigger: outer.current,
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: (self) => {
        state.p = self.progress;
        lastP = self.progress;
        render(state.p);
      },
      onUpdate: (self) => {
        if (Math.abs(self.progress - lastP) < 0.00005) return;
        lastP = self.progress;
        gsap.to(state, { p: self.progress, duration: 0.55, ease: 'power2.out', overwrite: true, onUpdate: () => render(state.p) });
      },
    });
    const onResize = () => {
      render(state.p);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      trigger.kill();
      gsap.killTweensOf(state);
    };
  }, []);

  const { s } = art;
  const box = { position: 'absolute' as const, left: art.left, top: art.top, width: ART_W * s, height: ART_H * s, ['--s' as string]: s };
  const strip = (id: string, f: number, children: React.ReactNode, opacity?: string) => (
    <div key={id} data-par={f} style={{ ...fill, width: '200%', willChange: 'transform', opacity }}>
      {children}
    </div>
  );
  const half = (i: 0 | 1): React.CSSProperties => ({ position: 'absolute', top: 0, height: '100%', left: `${i * 50}%`, width: '50%', imageRendering: 'pixelated' });

  return (
    <div ref={outer} id="story" style={{ position: 'relative', height: phone ? '440svh' : '540svh' }}>
      <div ref={stage} style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden', background: '#24234F' }}>
        {/* sky and sun: fixed behind everything, warming with the story */}
        <motion.div exit={{ scale: 1.08 }} transition={{ duration: 0.7, ease: 'easeIn' }} style={{ ...fill, transformOrigin: '62% 70%' }}>
          <div aria-hidden="true" style={{ ...fill, overflow: 'hidden' }}>
            <div style={box}>
              <PixelCanvas draw={drawSkyTwilight} variant="landing" />
              <PixelCanvas draw={drawSkyDawn} variant="landing" style={{ opacity: 'var(--dawn)' }} />
              <div style={{ ...fill, opacity: 'var(--stars)' }}>
                <TwinkleStars points={STARS} />
              </div>
              <PixelCanvas draw={drawSunTwilight} variant="landing" style={{ transform: `translateY(calc(var(--s) * var(--sunT) * 1px))`, opacity: 'calc(1 - var(--dawn) * 1.6)' }} />
              <PixelCanvas draw={drawSunDawn} variant="landing" style={{ transform: `translateY(calc(var(--s) * var(--sunD) * 1px))`, opacity: 'clamp(0, calc((var(--dawn) - 0.25) * 2), 1)' }} />
              <div data-par={0.1} style={{ ...fill, willChange: 'transform' }}>
                <PixelCanvas draw={drawCloudsLanding} variant="landing" style={{ animation: 'px-drift 48s ease-in-out infinite' }} />
              </div>
              {RANGES.map(([layer, f]) =>
                strip(
                  `r${layer}`,
                  f,
                  <>
                    <PixelCanvas draw={rangeDrawer(0, layer, false)} variant="landing" style={half(0)} />
                    <PixelCanvas draw={rangeDrawer(1, layer, false)} variant="landing" style={half(1)} />
                    <div style={{ ...fill, opacity: 'var(--dawn)' }}>
                      <PixelCanvas draw={rangeDrawer(0, layer, true)} variant="landing" style={half(0)} />
                      <PixelCanvas draw={rangeDrawer(1, layer, true)} variant="landing" style={half(1)} />
                    </div>
                  </>,
                ),
              )}
            </div>
          </div>

          {/* the world: three panels side by side, moved as one by the camera */}
          <div style={{ ...fill, overflow: 'hidden', pointerEvents: 'none' }}>
            <div ref={world} style={{ position: 'absolute', left: art.left, top: art.top, width: ART_W * 3 * s, height: ART_H * s, ['--s' as string]: s, willChange: 'transform' }}>
              {/* panel A: the graveyard */}
              <div style={panelStyle(0)}>
                <PixelCanvas draw={drawLandA} variant="landing" />
                <PixelCanvas draw={pathA} variant="landing" />
                <LanternGlows points={LANTERNS_A} />
                <Petals points={PETALS_A} />
                <Zzz points={ZZZ_A} />
                <div
                  style={{
                    position: 'absolute',
                    left: `${(STONE_ROW_X / ART_W) * 100}%`,
                    bottom: `${((ART_H - GROUND_Y) / ART_H) * 100}%`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 50,
                    transform: 'scale(calc(var(--s) / 5))',
                    transformOrigin: 'left bottom',
                    pointerEvents: 'auto',
                  }}
                >
                  {stones.map((st, i) => (
                    <Gravestone key={st.id} project={st} variant="landing" layoutId={`stone-${st.id}`} selected={active === i} onClick={() => onEnter(st.id)} />
                  ))}
                </div>
                <PixelCanvas draw={drawFrontGrassA} variant="landing" style={{ animation: 'px-sway 2.4s steps(1, end) infinite' }} />
                <GraveyardProps px={s * 1.2} centers={LANDING_STONE_CENTERS} />
                <Fireflies points={FIREFLIES_A} />
              </div>

              {/* panel B: the crossroads */}
              <div style={panelStyle(1)}>
                <PixelCanvas draw={drawGroundB} variant="landing" />
                <PixelCanvas draw={pathB} variant="landing" />
                <ReasonPosts />
                {CROSS.posts.map((x, i) => (
                  <div
                    key={x}
                    style={{
                      position: 'absolute',
                      left: `${((x - 14) / ART_W) * 100}%`,
                      top: `${((CROSS.islandTop - 31) / ART_H) * 100}%`,
                      width: `${(29 / ART_W) * 100}%`,
                      height: `${(11 / ART_H) * 100}%`,
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      fontSize: 'max(11px, calc(var(--s) * 2.4px))',
                      color: '#2E1E18',
                    }}
                  >
                    {PATHS_COPY[i].label}
                  </div>
                ))}
                <CrossroadsProps px={s} />
              </div>

              {/* panel C: the sunrise */}
              <div style={panelStyle(2)}>
                <PixelCanvas draw={drawGroundC} variant="landing" />
                <SunriseProps px={s} />
                <Fireflies points={FIREFLIES_C} />
                <Petals points={PETALS_C} />
              </div>

              <Ghost px={s * 1.5} />
            </div>
          </div>

          {/* warm light, and the corner leaves that frame the very first screen */}
          <div aria-hidden="true" style={{ ...fill, pointerEvents: 'none', background: 'radial-gradient(ellipse at 66% 52%, rgba(255,214,140,0.85), rgba(255,170,120,0.28) 45%, transparent 75%)', opacity: 'var(--warm)' }} />
          <div aria-hidden="true" style={{ ...fill, pointerEvents: 'none', opacity: 'var(--leaf)' }}>
            <div style={box}>
              <PixelCanvas draw={drawLeaves} variant="landing" />
            </div>
          </div>
        </motion.div>

        {/* words */}
        <motion.div exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: 'easeIn' }} style={{ ...fill, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <NavBar variant="landing" onLogin={() => onEnter()} onGetStarted={() => onEnter()} onHow={() => jump(0.1)} onExplore={() => jump(0.5)} />
          </div>

          <div data-from={-1} data-to={0.065} data-fade={0.035} className="journey-hero" style={{ position: 'absolute', left: '2vw', top: '17vh' }}>
            <Hero onEnter={() => jump(0.09)} />
            <button type="button" className="scroll-cue" onClick={() => jump(0.09)} style={{ marginLeft: 48, marginTop: 26 }}>
              FOLLOW THE GHOST <span aria-hidden="true" className="cue-arrow">↓</span>
            </button>
          </div>
          <div data-from={-1} data-to={0.04} data-fade={0.03} className="scroll-badge" aria-hidden="true">
            <span className="scroll-mouse"><i /></span>
            <span>
              Scroll to follow
              <br />
              the ghost's story
            </span>
          </div>
          <div data-from={-1} data-to={0.05} data-fade={0.03} className="journey-stats" style={{ position: 'absolute', left: '50%', bottom: '3vh', transform: 'translateX(-50%)', width: 'max-content', maxWidth: '96vw' }}>
            <StatsBar />
          </div>

          {CAPTIONS.map((c) => (
            <div key={c.id} data-from={c.from} data-to={c.to} className="journey-caption" style={{ position: 'absolute', opacity: 0, visibility: 'hidden' }}>
              {c.kicker && <p className="journey-kicker">{c.kicker}</p>}
              <p className="journey-line">{c.text}</p>
              {c.sub && <p className="journey-sub">{c.sub}</p>}
              {c.list && (
                <ul className="journey-list" aria-label="What Relaunch shows you">
                  {c.list.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* the line for whichever path the ghost is standing at */}
          <div className="journey-path-line" aria-live="polite">
            {PATHS_COPY.map((pc, i) => (
              <div key={pc.label} className="journey-path-box" style={{ opacity: `var(--pm${i})`, borderColor: pc.accent, ['--accent' as string]: pc.accent }}>
                <span className="journey-path-name" style={{ background: pc.accent }}>
                  {pc.label}
                </span>
                {pc.line}
              </div>
            ))}
          </div>

          <div data-from={0.9} data-to={1.3} data-fade={0.04} className="journey-finale" style={{ position: 'absolute', opacity: 0, visibility: 'hidden' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'clamp(32px, 4.2vw, 72px)',
                lineHeight: 1.1,
                margin: 0,
                color: 'var(--color-text-primary)',
                textShadow: pixelOutline('var(--color-stone-outline)', 2, 6),
              }}
            >
              SAME IDEAS.
              <br />
              A <span style={{ color: 'var(--color-gold)' }}>CLEARER</span> TOMORROW.
            </h2>
            <p className="journey-sub" style={{ marginTop: 14 }}>
              Your next chapter starts with one small decision.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22, marginTop: 20 }}>
              <PixelButton variant="gold" size="lg" onClick={plant}>
                BRING AN IDEA BACK TO LIFE →
              </PixelButton>
              <button type="button" className="journey-link" onClick={() => jump(0)}>
                EXPLORE THE GRAVEYARD AGAIN
              </button>
            </div>
          </div>

          <nav aria-label="Story chapters" className="journey-dots">
            {CHAPTERS.map((c, i) => (
              <button key={c.label} type="button" data-dot={i} onClick={() => jump(c.p)} aria-label={c.label} title={c.label}>
                <span />
              </button>
            ))}
          </nav>
        </motion.div>
      </div>
    </div>
  );
}

export { bump };
