import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { preloadImages, preloadVideos } from "../data/preload";
import useReducedMotion from "../hooks/useReducedMotion";
import "./loader.css";

gsap.registerPlugin(ScrollTrigger);

const MAX_WAIT = 12000; // never hold the page hostage if something stalls

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // one bad asset shouldn't hang the whole site
    img.src = src;
  });
}

function preloadVideo(src) {
  // A full fetch (rather than just <video preload>) guarantees the
  // bytes are actually in cache, so when the real <video> element
  // requests the same URL later it resolves instantly.
  return fetch(src, { cache: "force-cache" })
    .then((res) => res.blob())
    .catch(() => {});
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Holds the page behind a themed loop until every image and ink clip
 * the experience needs is actually warm in the browser's cache — not
 * a fixed timer — then plays a single "the world opens" iris transition
 * (an SVG-masked circle growing from the loop's own center, the same
 * technique used for the project reveals) and unmounts.
 */
function Loader() {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const circleRef = useRef(null);
  const loopRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const assets = Promise.all([
      ...preloadImages.map(preloadImage),
      ...preloadVideos.map(preloadVideo),
      fonts,
    ]);
    // A brief floor so the loop animation reads as intentional rather
    // than a flash, even on a fast connection/warm cache.
    const floor = delay(900);
    const timeout = delay(MAX_WAIT);

    Promise.race([Promise.all([assets, floor]), timeout]).then(() => {
      if (!cancelled) {
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

    // The loop gathers itself once, then the world opens outward from
    // that exact point — "a project opening," not a generic wipe.
    tl.to(loopRef.current, { scale: 0.5, opacity: 0, duration: 0.3, ease: "power2.in" })
      .to(circleRef.current, { attr: { r: maxRadius }, duration: 1.05, ease: "power3.inOut" }, "-=0.05");
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
        <span className="loader__ring loader__ring--delay" />
        <span className="loader__pulse" />
      </div>
    </div>
  );
}

export default Loader;
