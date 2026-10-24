/**
 * Single configurable source for the hero video.
 * The file lives in /public/videos. It is the supplied animation re-encoded with
 * a keyframe on every frame (no audio) so scroll-scrubbing stays smooth.
 * The untouched upload is kept in /source-video/original-upload.mp4.
 */
export const VIDEO_URL = `${import.meta.env.BASE_URL}videos/relaunch-graveyard.mp4`;

/** First frame of the supplied video, extracted from it. Used as poster + fallback. */
export const POSTER_URL = `${import.meta.env.BASE_URL}videos/poster.jpg`;
