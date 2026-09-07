import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { preloadImages, preloadVideos } from "../data/preload";
import useReducedMotion from "../hooks/useReducedMotion";
import logoMark from "../assets/images/logo-mark.webp";
import "./loader.css";

gsap.registerPlugin(ScrollTrigger);

const MAX_WAIT = 15000; // never hold the page hostage if something stalls

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // one bad asset shouldn't hang the whole site
    img.src = src;
  });
}

function preloadVideo(src) {
  // A real <video> element loaded the same way playback will load it
  // (rather than a raw fetch()) — browsers often serve video over
  // byte-range requests that a plain fetch() populates differently in
  // the HTTP cache, so this is what actually guarantees the real
  // <video> elements later hit a warm cache instead of re-fetching.
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const cleanup = () => {
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("error", onReady);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    video.addEventListener("canplaythrough", onReady, { once: true });
    video.addEventListener("error", onReady, { once: true });
    video.src = src;
    video.load();
  });
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Holds the page — genuinely inert, not just visually covered — behind
 * a themed loop with a live progress readout until every image and ink
 * clip the experience needs is actually warm in the browser's cache,
 * then plays a single "the world opens" iris transition and unmounts.
 */
function Loader() {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [percent, setPercent] = useState(0);
  const circleRef = useRef(null);
  const loopRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    const fonts = document.fonts ? [document.fonts.ready] : [];
    const jobs = [...preloadImages.map(preloadImage), ...preloadVideos.map(preloadVideo), ...fonts];
    const total = jobs.length || 1;
    let loaded = 0;

    const tracked = jobs.map((job) =>
      job.then(() => {
        loaded += 1;
        if (!cancelled) setPercent(Math.round((loaded / total) * 100));
      })
    );

    // A brief floor so the loop reads as intentional rather than a
    // flash, even on a fast connection/warm cache.
    const floor = delay(900);
    const timeout = delay(MAX_WAIT);

    Promise.race([Promise.all([...tracked, floor]), timeout]).then(() => {
      if (!cancelled) {
        setPercent(100);
        // Every image is now guaranteed to have its real dimensions —
        // this is the first moment the page's true scrollable height
        // is stable, so any ScrollTrigger created earlier (while
        // images were still placeholder-sized) gets re-measured here
        // rather than staying keyed to a layout that no longer exists.
        ScrollTrigger.refresh();
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (reducedMotion) {
      setVisible(false);
      return;
    }

    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.58;
    const tl = gsap.timeline({ onComplete: () => setVisible(false) });

    // The mark gathers itself once, then the world opens outward from
    // that exact point — "a project opening," not a generic wipe.
    tl.to(loopRef.current, { scale: 0.6, opacity: 0, duration: 0.35, ease: "power2.in" })
      .to(circleRef.current, { attr: { r: maxRadius }, duration: 1.1, ease: "power3.inOut" }, "-=0.05");
  }, [ready, reducedMotion]);

  if (!visible) return null;

  const urlBase = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";

  return (
    <div className="loader" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <mask id="loader-iris" maskContentUnits="userSpaceOnUse">
            <rect x="-50%" y="-50%" width="200%" height="200%" fill="white" />
            <circle ref={circleRef} cx="50%" cy="50%" r="0" fill="black" />
          </mask>
        </defs>
      </svg>

      <div
        className="loader__backdrop"
        style={{
          maskImage: `url(${urlBase}#loader-iris)`,
          WebkitMaskImage: `url(${urlBase}#loader-iris)`,
        }}
      />

      <div ref={loopRef} className="loader__loop">
        <span className="loader__ring" />
        <img src={logoMark} alt="" className="loader__mark" />
        <div className="loader__progress">
          <span className="loader__percent">{percent}%</span>
          <div className="loader__bar">
            <div className="loader__bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
