import { FileText, Gauge, Signpost, Sparkles, type LucideIcon } from "lucide-react";
import { PixelButton } from "@/src/landing/components/PixelButton";
import { Reveal } from "@/src/landing/components/Reveal";
import { PathIcon } from "@/src/landing/components/icons";
import { RELAUNCH_PATHS } from "@/src/landing/data/relaunchPaths";

interface Scene {
  id: string;
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  points: string[];
  side: "left" | "right";
  accent: string;
}

const SCENES: Scene[] = [
  {
    id: "features",
    n: "01",
    icon: FileText,
    title: "Capture it",
    body: "Log an unfinished project in about two minutes.",
    points: ["What the idea was", "How far you got", "Why it stopped, with no judgement"],
    side: "left",
    accent: "#A982F2",
  },
  {
    id: "understand",
    n: "02",
    icon: Sparkles,
    title: "Understand it",
    body: "See what you built, how long it has rested, and which parts can still be reused.",
    points: ["A page and a timeline for every project", "Reusable code, designs, data and research"],
    side: "right",
    accent: "#FFC857",
  },
  {
    id: "score",
    n: "03",
    icon: Gauge,
    title: "Get a clear score",
    body: "A transparent Relaunch Score shows how worth reviving each project is.",
    points: ["Five factors, every weight visible", "Plain-language reasons, no black box"],
    side: "left",
    accent: "#A8E6A1",
  },
];

function Card({ scene }: { scene: Scene }) {
  const Icon = scene.icon;
  return (
    <section
      id={scene.id}
      aria-labelledby={`${scene.id}-title`}
      className="relative z-10 mx-auto flex min-h-[100svh] w-[90%] max-w-[1280px] items-start justify-center pt-[16vh] md:justify-end"
    >
      <Reveal className="px-box w-full max-w-[26rem] bg-navy/85 p-6 sm:p-8">
        <p className="font-pixel text-[10px] uppercase tracking-wider" style={{ color: scene.accent }}>
          {scene.n} / {scene.title.split(" ")[0]}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-navy text-navy" style={{ background: scene.accent }}>
            <Icon size={26} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <h2 id={`${scene.id}-title`} className="text-[1.7rem] font-extrabold leading-tight text-soft">
            {scene.title}
          </h2>
        </div>
        <p className="mt-4 text-[17px] leading-relaxed text-[#e9e5ff]">{scene.body}</p>
        <ul className="mt-4 space-y-2.5">
          {scene.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px] text-cream">
              <span aria-hidden="true" className="mt-[7px] h-2.5 w-2.5 shrink-0" style={{ background: scene.accent }} />
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function FeatureScenes({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      {SCENES.map((s) => (
        <Card key={s.id} scene={s} />
      ))}

      <section id="paths-scene" aria-labelledby="paths-title" className="relative z-10 mx-auto flex min-h-[100svh] w-[90%] max-w-[1280px] items-start justify-center pt-[16vh] md:justify-end">
        <Reveal className="px-box w-full max-w-[30rem] bg-navy/85 p-6 sm:p-8">
          <p className="font-pixel text-[10px] uppercase tracking-wider text-[#FF9DB5]">04 / Decide</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-navy bg-[#FF9DB5] text-navy">
              <Signpost size={26} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <h2 id="paths-title" className="text-[1.7rem] font-extrabold leading-tight text-soft">
              Five paths, a clear next step
            </h2>
          </div>
          <p className="mt-4 text-[17px] leading-relaxed text-[#e9e5ff]">Every project gets a suggestion. You make the call, and letting go counts as a proper ending.</p>
          <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {RELAUNCH_PATHS.map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-[3px] border-navy px-3 py-2" style={{ background: p.color }}>
                <PathIcon name={p.icon} size={20} aria-hidden="true" />
                <span className="font-pixel text-[10px] uppercase text-navy">{p.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section id="cta" aria-labelledby="cta-title" className="relative z-10 mx-auto flex min-h-[100svh] w-[90%] max-w-[1280px] items-start justify-center pt-[16vh] md:justify-end">
        <Reveal className="px-box w-full max-w-[26rem] bg-navy/85 p-6 text-center sm:p-8">
          <h2 id="cta-title" className="text-[1.7rem] font-extrabold leading-tight text-soft">
            Same ideas. A clearer tomorrow.
          </h2>
          <p className="mt-3 text-[16px] text-[#e9e5ff]">Everything stays on your device. No account needed.</p>
          <div className="mt-6 flex justify-center">
            <PixelButton variant="gold" size="lg" accent="arrow" onClick={onGetStarted}>
              Get started
            </PixelButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
