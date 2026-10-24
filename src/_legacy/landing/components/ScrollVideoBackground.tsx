import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { POSTER_URL, VIDEO_URL } from "@/src/landing/config";
import { useMediaQuery } from "@/src/landing/hooks/useMediaQuery";
import { useReducedMotion } from "@/src/landing/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/** Skip seeks smaller than ~half a frame at 24fps. */
const MIN_SEEK_DELTA = 1 / 48;
/** Stay a hair before the last frame so the video never "ends". */
const END_PADDING = 0.04;

type Mode = "scrub" | "loop" | "static";

/**
 * Fixed full-viewport video behind the whole page.
 *  - desktop:        playback position is driven by page scroll (GSAP ScrollTrigger)
 *  - mobile/coarse:  plain muted looping playback (precise seeking is unreliable there)
 *  - reduced motion: poster frame only
 *  - load failure:   poster frame (or flat indigo) – layout never depends on the video
 */
export function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const mode: Mode = reduced ? "static" : compact ? "loop" : "scrub";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;

    const onReady = () => setReady(true);
    const onError = () => setFailed(true);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);
    if (video.readyState >= 2) setReady(true);

    // ---------- static: poster only ----------
    if (mode === "static") {
      video.pause();
      return () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onError);
      };
    }

    // ---------- loop: simple autoplay ----------
    if (mode === "loop") {
      video.loop = true;
      video.play().catch(() => {
        /* autoplay refused – the poster remains visible, nothing breaks */
      });
      return () => {
        video.pause();
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onError);
      };
    }

    // ---------- scrub: scroll-driven seeking ----------
    video.loop = false;
    video.pause();

    let progress = 0; // latest normalised scroll progress (0..1)
    let target = 0; // latest requested timestamp (seconds)
    let pendingFrame = 0; // rAF id for coalescing scroll updates
    let trigger: ScrollTrigger | null = null;
    let destroyed = false;

    const hasDuration = () => Number.isFinite(video.duration) && video.duration > 0;

    /** Apply the latest requested time unless a seek is already in flight. */
    const flush = () => {
      pendingFrame = 0;
      if (destroyed || !hasDuration()) return;
      if (video.seeking) return; // deferred – the "seeked" handler calls flush again
      if (Math.abs(video.currentTime - target) < MIN_SEEK_DELTA) return;
      video.currentTime = target;
      // Optional: also be notified when the new frame is actually presented.
      if ("requestVideoFrameCallback" in video) {
        (video as HTMLVideoElement & {
          requestVideoFrameCallback: (cb: () => void) => number;
        }).requestVideoFrameCallback(() => schedule());
      }
    };

    const schedule = () => {
      if (!pendingFrame && !destroyed) pendingFrame = requestAnimationFrame(flush);
    };

    const request = (p: number) => {
      progress = Math.min(1, Math.max(0, p));
      if (!hasDuration()) return; // wait for metadata; applied on loadedmetadata
      target = Math.max(0, video.duration - END_PADDING) * progress;
      schedule();
    };

    const onSeeked = () => {
      // If scrolling continued while seeking, catch up to the newest request.
      if (Math.abs(video.currentTime - target) >= MIN_SEEK_DELTA) schedule();
    };

    const setup = () => {
      if (destroyed || trigger || !hasDuration()) return;
      trigger = ScrollTrigger.create({
        start: 0,
        // 1.0 when the footer's top reaches ~20% of the viewport height
        end: () => {
          const footer = document.getElementById("site-footer");
          if (!footer) return ScrollTrigger.maxScroll(window);
          const top = footer.getBoundingClientRect().top + window.scrollY;
          return Math.max(1, top - window.innerHeight * 0.2);
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => request(self.progress),
        onRefresh: (self) => request(self.progress),
      });
      request(trigger.progress);
    };

    const onMeta = () => {
      if (!hasDuration()) return; // zero/NaN duration – stay on the poster
      setup();
      request(progress);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    if (video.readyState >= 1) onMeta();

    return () => {
      destroyed = true;
      if (pendingFrame) cancelAnimationFrame(pendingFrame);
      trigger?.kill();
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
    };
  }, [mode, failed]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-navy">
      {/* poster / fallback layer — always painted under the video */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat [background-position:72%_58%] md:[background-position:50%_50%]"
        style={{ backgroundImage: `url(${POSTER_URL})` }}
      />
      {!failed && (
        <video
          ref={videoRef}
          src={VIDEO_URL}
          poster={POSTER_URL}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 [object-position:72%_58%] md:[object-position:50%_50%]"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}
      {/*
        The supplied video has its own (AI-rendered, typo-ridden) nav, hero copy, tooltip and stats bar baked in.
        Feathered mist panels hide them so the real HTML can take over. They live in this fixed layer so the
        baked text stays hidden in every section, not just the hero.
      */}
      {/* hides the text and stats baked into the video; the tree, sunset, mountains and tombstones stay crisp */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-[13%] min-h-[96px]"
          style={{ background: "linear-gradient(to bottom, rgba(23,24,62,.97) 0, rgba(23,24,62,.9) 55%, transparent 100%)" }}
        />
        <div
          className="absolute left-0 top-[8%] hidden h-[54%] w-[58%] md:block"
          style={{
            background: "linear-gradient(90deg, rgb(23,24,62) 0, rgb(28,30,80) 62%, rgba(28,30,80,.85) 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, #000 0, #000 82%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 16%, #000 80%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, #000 0, #000 82%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 16%, #000 80%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[17%]"
          style={{ background: "linear-gradient(to top, rgb(23,24,62) 0, rgb(23,24,62) 45%, transparent 100%)" }}
        />
      </div>
    </div>
  );
}
