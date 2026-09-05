import heroAvatar from "../assets/images/hero-avatar.webp";
import heroTextBg from "../assets/images/hero-text-bg.png";
import portraitCinematic from "../assets/images/portrait/portrait-cinematic.webp";
import portraitSeated from "../assets/images/portrait/portrait-seated.webp";
import logoMark from "../assets/images/logo-mark.webp";
import navLogo from "../assets/images/logo-with-transparent-bg.png";
import projects from "./projects";

/**
 * Every image/video the first-visit experience touches. The Loader
 * (components/Loader.jsx) preloads all of it before releasing the
 * page, so nothing pops in or stutters mid-scroll later — the
 * trade-off is an honest one-time wait up front instead of any
 * mid-experience lag.
 *
 * The technology creatures (data/creatures.js, components/Creature/)
 * are temporarily unused — not deleted, just not rendered anywhere
 * right now — so their assets aren't listed here either. Re-add
 * `...Object.values(creatures).map((c) => c.asset)` if they come back.
 */
export const preloadImages = [
  heroAvatar,
  heroTextBg,
  portraitCinematic,
  portraitSeated,
  logoMark,
  navLogo,
  ...projects.map((p) => p.image),
];

export const preloadVideos = [
  ...projects.map((p) => p.inkVideo).filter(Boolean),
  "/videos/ink/ink-03.mp4", // Contact section's pool
];
