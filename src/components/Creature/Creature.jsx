import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "../../hooks/useReducedMotion";
import useMediaQuery from "../../hooks/useMediaQuery";
import "./creature.css";

gsap.registerPlugin(ScrollTrigger);

const PROXIMITY_RADIUS = 190; // px — how close the cursor needs to be to register
const MAX_LEAN = 7; // px — deliberately tiny; this is a notice, not a chase

/**
 * A small inhabitant of the portfolio. Content (name/tag/asset) comes
 * from `creature` (see data/creatures.js); *where* it sits is up to
 * whatever `className`/inline style the parent section passes in —
 * this component only owns behavior, never layout position.
 *
 * Two nested layers keep independent transforms from fighting each
 * other: the outer layer carries scroll parallax, the inner layer
 * carries the cursor "lean" + hover/idle motion.
 *
 * `depth` (0–1) controls how much it drifts during scroll parallax —
 * give creatures further from the "camera" a smaller value.
 */
function Creature({ creature, className = "", size = 56, depth = 0.4 }) {
  const rootRef = useRef(null);
  const parallaxRef = useRef(null);
  const leanRef = useRef(null);
  const rippleRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const isFinePointer = useMediaQuery("(pointer: fine)");
  const isNarrow = useMediaQuery("(max-width: 720px)");
  const isTiny = useMediaQuery("(max-width: 420px)");

  // Scale down rather than hide on small screens — these are meant to
  // be discovered everywhere, not just on desktop.
  const effectiveSize = Math.round(size * (isTiny ? 0.56 : isNarrow ? 0.68 : 1));

  // Entrance: a quiet fade/rise the first time it's actually on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (reducedMotion) {
      root.classList.add("is-visible");
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && root.classList.add("is-visible"),
      { threshold: 0.2 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reducedMotion]);

  // Subtle scroll parallax on the outer layer — a different drift
  // speed than its surroundings, for a bit of layered depth.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const root = rootRef.current;
    const layer = parallaxRef.current;
    if (!root || !layer) return undefined;

    const range = 26 * depth;
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.8,
      onUpdate: (self) => gsap.set(layer, { y: (self.progress - 0.5) * range }),
    });
    return () => trigger.kill();
  }, [reducedMotion, depth]);

  // Cursor proximity on the inner layer — a tiny lean toward the
  // cursor when it wanders close. Nothing chasing, nothing dramatic.
  useEffect(() => {
    if (reducedMotion || !isFinePointer || !creature.cursorReactive) return undefined;
    const layer = leanRef.current;
    if (!layer) return undefined;

    const moveX = gsap.quickTo(layer, "x", { duration: 0.6, ease: "power3.out" });
    const moveY = gsap.quickTo(layer, "y", { duration: 0.6, ease: "power3.out" });
    let raf = null;

    const update = (e) => {
      raf = null;
      const rect = layer.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < PROXIMITY_RADIUS) {
        const pull = 1 - dist / PROXIMITY_RADIUS;
        moveX((dx / dist) * MAX_LEAN * pull);
        moveY((dy / dist) * MAX_LEAN * pull);
      } else {
        moveX(0);
        moveY(0);
      }
    };
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => update(e));
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isFinePointer, creature.cursorReactive]);

  useEffect(() => {
    if (!hovered || reducedMotion) return;
    const ripple = rippleRef.current;
    if (!ripple) return;
    gsap.fromTo(
      ripple,
      { attr: { r: 1 }, opacity: 0.5 },
      { attr: { r: effectiveSize * 0.9 }, opacity: 0, duration: 1, ease: "power2.out" }
    );
  }, [hovered, reducedMotion, effectiveSize]);

  const Asset = creature.AssetComponent;

  return (
    <div
      ref={rootRef}
      className={`creature ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      aria-label={`${creature.name} — ${creature.tag}`}
    >
      <div ref={parallaxRef} className="creature__parallax">
        <div
          ref={leanRef}
          className={`creature__inner${hovered ? " is-hovered" : ""}`}
          style={{ width: effectiveSize, height: effectiveSize }}
        >
          <svg className="creature__ripple" aria-hidden="true">
            <circle ref={rippleRef} cx="50%" cy="50%" r="0" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0" />
          </svg>
          {Asset ? (
            <Asset className="creature__asset" />
          ) : (
            <img src={creature.asset} alt="" className="creature__asset" draggable={false} />
          )}
        </div>
      </div>

      <div className="creature__label" aria-hidden="true">
        <span className="creature__label-name">{creature.name}</span>
        <span className="creature__label-tag">{creature.tag}</span>
      </div>
    </div>
  );
}

export default Creature;
