import { at, u } from './stage';

type Pt = [number, number];

/* Small animated sprites positioned on the art grid. All motion is CSS keyframes, so the
 * global prefers-reduced-motion rule in theme.css freezes them. */

export function TwinkleStars({ points }: { points: Pt[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={i}
          style={{
            ...at(x, y),
            width: u(1),
            height: u(1),
            background: '#F8F3FF',
            boxShadow: `${u(1)} 0 0 #B995FF, ${u(-1)} 0 0 #B995FF, 0 ${u(1)} 0 #B995FF, 0 ${u(-1)} 0 #B995FF`,
            animation: `px-twinkle ${2.6 + (i % 3) * 0.7}s ease-in-out ${i * 0.55}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function Fireflies({ points }: { points: Pt[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={i}
          style={{
            ...at(x, y),
            width: u(1),
            height: u(1),
            background: '#FFD166',
            boxShadow: `0 0 ${u(2)} ${u(0.6)} rgba(255,209,102,0.55)`,
            animation: `px-firefly ${6 + (i % 4)}s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function LanternGlows({ points }: { points: Pt[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={i}
          style={{
            ...at(x - 9, y - 9),
            width: u(19),
            height: u(19),
            background: 'radial-gradient(circle, rgba(255,201,77,0.5) 0%, rgba(255,190,85,0.2) 38%, rgba(255,190,85,0) 70%)',
            animation: `px-pulse 2.8s ease-in-out ${i * 0.9}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function Petals({ points }: { points: Pt[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={i}
          style={{
            ...at(x, y),
            width: u(2),
            height: u(1),
            background: '#EDB0D5',
            opacity: 0,
            animation: `px-fall 9s linear ${2 + i * 3.1}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function Zzz({ points }: { points: Pt[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <span
          key={i}
          style={{
            ...at(x, y),
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: u(i === 1 ? 7 : 5),
            lineHeight: 1,
            color: '#F8F3FF',
            textShadow: `${u(0.5)} ${u(0.5)} 0 #3A2F6E`,
            opacity: 0,
            animation: `px-z 3.6s ease-out ${i * 1.2}s infinite`,
          }}
        >
          {i === 1 ? 'Z' : 'z'}
        </span>
      ))}
    </>
  );
}
