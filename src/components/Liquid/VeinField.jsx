import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { generateVeins } from "../../utils/veinGenerator";
import useReducedMotion from "../../hooks/useReducedMotion";
import useMediaQuery from "../../hooks/useMediaQuery";
import "./veinField.css";

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_W = 1000;
const VIEWPORT_H = 1000;

/**
 * A fixed, full-viewport ambient background: a branching vein-like
 * network that breathes (a slow inhale/exhale scale+opacity cycle) and
 * carries a couple of slow pulses of light along its main vessels,
 * independent of scroll — plus one or two thicker vessels whose
 * pigment fill is tied to overall scroll progress and picks up each
 * project's accent color as it's passed (via the shared --vein-color
 * custom property, set by the projects section).
 */
function VeinField() {
  const svgRef = useRef(null);
  const vesselRefs = useRef([]);
  const bgRef = useRef(null);
  const fgRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const [seed] = useState(() => Math.floor(Math.random() * 100000));

  const { background, foreground, vessels } = useMemo(() => {
    const all = generateVeins({ width: VIEWPORT_W, height: VIEWPORT_H, seed, rootCount: 5, maxDepth: 4 });
    return {
      background: all.filter((b) => b.depth >= 2),
      foreground: all.filter((b) => b.depth < 2),
      vessels: all.filter((b) => b.depth === 0).slice(0, 2),
    };
  }, [seed]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const paths = vesselRefs.current.filter(Boolean);
    if (!paths.length) return undefined;

    const lengths = paths.map((p) => p.getTotalLength());
    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]}`;
      p.style.strokeDashoffset = `${lengths[i]}`;
    });

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.7,
      onUpdate: (self) => {
        paths.forEach((p, i) => {
          p.style.strokeDashoffset = `${lengths[i] * (1 - self.progress)}`;
        });
        // The two depth layers drift a little in opposite directions
        // across the whole scroll — even though the field itself is
        // fixed to the viewport, this keeps it from reading as one
        // static, flat backdrop the whole time.
        const drift = (self.progress - 0.5) * 2;
        if (bgRef.current) gsap.set(bgRef.current, { y: drift * 22, x: drift * -8 });
        if (fgRef.current) gsap.set(fgRef.current, { y: drift * -12, x: drift * 5 });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion, vessels]);

  const disableAmbient = reducedMotion;

  return (
    <div className={`vein-field${isCoarsePointer ? " vein-field--simple" : ""}`} aria-hidden="true">
      <svg
        ref={svgRef}
        className={`vein-field__svg${disableAmbient ? "" : " vein-field__svg--breathing"}`}
        viewBox={`0 0 ${VIEWPORT_W} ${VIEWPORT_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="vein-blur-bg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="vein-blur-fg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <radialGradient id="vein-pulse-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g ref={bgRef} className="vein-field__background" filter="url(#vein-blur-bg)">
          {background.map((b, i) => (
            <path key={`bg-${i}`} d={b.d} stroke="#7a2f28" strokeWidth={b.width} opacity={b.opacity * 0.6} fill="none" strokeLinecap="round" />
          ))}
        </g>

        <g ref={fgRef} className="vein-field__foreground" filter="url(#vein-blur-fg)">
          {foreground.map((b, i) => (
            <path key={`fg-${i}`} d={b.d} stroke="#9c3a2e" strokeWidth={b.width} opacity={b.opacity} fill="none" strokeLinecap="round" />
          ))}
        </g>

        <g className="vein-field__vessels">
          {vessels.map((v, i) => (
            <path
              key={`vessel-${i}`}
              ref={(el) => (vesselRefs.current[i] = el)}
              d={v.d}
              stroke="var(--vein-color, var(--ink))"
              strokeWidth={v.width * 0.9}
              opacity="0.85"
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {!disableAmbient &&
            vessels.map((v, i) => (
              <circle key={`pulse-${i}`} r="6" fill="url(#vein-pulse-glow)">
                <animateMotion dur={`${9 + i * 3}s`} repeatCount="indefinite" path={v.d} rotate="auto" begin={`${i * 2.4}s`} />
                <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.85;1" dur={`${9 + i * 3}s`} repeatCount="indefinite" begin={`${i * 2.4}s`} />
              </circle>
            ))}
        </g>
      </svg>
    </div>
  );
}

export default VeinField;
