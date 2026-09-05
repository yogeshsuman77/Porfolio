import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drifts `ref`'s element vertically as its trigger transits the
 * viewport, at `speed` px (roughly — it's scaled by the trigger's own
 * height) — different speeds on different elements is what actually
 * produces the "layered depth" feeling; the same speed everywhere is
 * just a scroll listener.
 *
 * `speed` can be negative (drifts up while scrolling down) or
 * positive (drifts down/lags behind). Small values (10–50) read as
 * "cinematic depth"; anything much bigger starts looking like a
 * glitch, per the brief's own "do NOT create extreme parallax" rule.
 */
export default function useParallax(ref, { speed = 24, trigger } = {}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const st = ScrollTrigger.create({
      trigger: trigger?.current || el,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.7,
      onUpdate: (self) => gsap.set(el, { y: (self.progress - 0.5) * speed }),
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, speed]);
}
