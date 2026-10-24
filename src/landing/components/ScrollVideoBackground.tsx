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
 *  - desktop:        playback position is driven by page scroll or loops gently
 *  - mobile/coarse:  plain muted looping playback
 *  - reduced motion: poster frame only
 *  - load failure:   poster frame
 */
export function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  // If user is on compact or reduced motion, use loop or static
  const mode: Mode = reduced ? "static" : compact ? "loop" : "loop";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;

    const onReady = () => setReady(true);
    const onError = () => setFailed(true);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);
    if (video.readyState >= 2) setReady(true);

    if (mode === "static") {
      video.pause();
      return () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onError);
      };
    }

    if (mode === "loop") {
      video.loop = true;
      video.play().catch(() => {
        /* autoplay policy fallback */
      });
      return () => {
        video.pause();
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onError);
      };
    }

    return () => {
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
          autoPlay
          loop
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 [object-position:72%_58%] md:[object-position:50%_50%]"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}

      {/*
        Delicate, precise mist masks that cleanly hide baked text in the background video
        while preserving the glorious glowing sunset, purple mountains, and pink cherry blossom tree!
      */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top header veil */}
        <div
          className="absolute inset-x-0 top-0 h-[12%] min-h-[80px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(19,16,50,0.98) 0%, rgba(19,16,50,0.85) 60%, transparent 100%)",
          }}
        />

        {/* Hero typography veil: soft gradient over left text area, leaving the center sunset & mountains radiant */}
        <div
          className="absolute left-0 top-[10%] hidden h-[50%] w-[48%] md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(19,16,50,0.95) 0%, rgba(23,24,62,0.8) 65%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%)",
          }}
        />

        {/* Bottom subtle meadow gradient behind stats bar */}
        <div
          className="absolute inset-x-0 bottom-0 h-[14%]"
          style={{
            background:
              "linear-gradient(to top, rgba(19,16,50,0.95) 0%, rgba(19,16,50,0.7) 50%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
