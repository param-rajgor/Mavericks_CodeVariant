/**
 * Single configurable source for the hero video.
 * The file lives in /public/videos. It is the supplied animation re-encoded with
 * a keyframe on every frame (no audio) so scroll-scrubbing stays smooth.
 * The untouched upload is kept in /source-video/original-upload.mp4.
 */
export const VIDEO_URL = "/videos/relaunch-graveyard.mp4";

/** First frame of the supplied video, extracted from it. Used as poster + fallback. */
export const POSTER_URL = "/videos/poster.jpg";

/**
 * External destinations. `null` = not provided yet: the UI shows a
 * "placeholder link" notice instead of linking somewhere invented.
 */
export const EXTERNAL_LINKS: Record<"contact" | "github" | "docs", string | null> = {
  contact: null,
  github: null,
  docs: null,
};
